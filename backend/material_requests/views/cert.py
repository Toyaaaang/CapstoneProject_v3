from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import get_template
from io import BytesIO
from xhtml2pdf import pisa

from ..models import Certification, DeliveryRecord, CertifiedItem
from ..serializers.cert import CertificationSerializer

class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all().order_by("-created_at")
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "id", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Certification.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(inspected_by=self.request.user)

    @action(detail=False, methods=["post"], url_path="start")
    def start_certification(self, request):
        if request.user.role not in ["warehouse_admin", "audit","engineering", "operations_maintenance"]:
            return Response({"detail": "Not authorized."}, status=403)

        delivery_id = request.data.get("delivery_record_id")
        if not delivery_id:
            return Response({"detail": "delivery_record_id is required."}, status=400)

        try:
            delivery = DeliveryRecord.objects.get(id=delivery_id)
        except DeliveryRecord.DoesNotExist:
            return Response({"detail": "Delivery record not found."}, status=404)

        existing = Certification.objects.filter(delivery_record=delivery).first()
        if existing:
            return Response({"id": existing.id}, status=200)

        qc = delivery.purchase_order.quality_checks.first()
        if not qc:
            return Response({"detail": "No quality check found for this PO."}, status=400)

        cert = Certification.objects.create(
            delivery_record=delivery,
            purchase_order=delivery.purchase_order,
            inspected_by=request.user,
            status="started"
        )

        items_to_certify = qc.items.filter(
            requires_certification=True,
            certifieditem__isnull=True
        )
        for item in items_to_certify:
            CertifiedItem.objects.create(
                certification=cert,
                po_item=item.po_item,
                quality_check_item=item
            )

        return Response({"id": cert.id}, status=201)

    @action(detail=True, methods=["get"], url_path="certification-status")
    def certification_status(self, request, pk=None):
        cert = self.get_object()
        po = cert.delivery_record.purchase_order
        qc = po.quality_checks.first()

        if not qc:
            return Response({"detail": "No quality check found."}, status=400)

        total_required = qc.items.filter(requires_certification=True).count()
        total_certified = cert.items.count()

        status_str = "complete" if total_certified == total_required else "in_progress"
        return Response({
            "status": status_str,
            "certified": total_certified,
            "required": total_required
        })

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        cert = self.get_object()
        delivery = cert.delivery_record
        po = delivery.purchase_order

        qc = po.quality_checks.filter(department=cert.inspected_by.role).first()
        if not qc:
            return Response({"detail": "No quality check found for this delivery."}, status=400)

        required = qc.items.filter(requires_certification=True).count()
        certified = cert.items.count()

        if certified < required:
            return Response({"detail": "Certification not yet complete."}, status=400)

        template = get_template("certification/certificate.html")
        html = template.render({"cert": cert})
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)

        if not pdf.err:
            filename = f"CERT-{po.po_number}.pdf"
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        return Response({"detail": "PDF generation failed."}, status=500)

    @action(detail=False, methods=["get"], url_path="monitoring")
    def monitoring(self, request):
        role = request.user.role

        queryset = Certification.objects.all().order_by("-created_at")

        if role == "audit":
            queryset = queryset.filter(audit_approved_by__isnull=True, rejected_by__isnull=True, is_finalized=False)
        elif role == "warehouse_admin":
            queryset = queryset.filter(admin_approved_by__isnull=True, rejected_by__isnull=True, is_finalized=False)
        elif role == "manager":
            queryset = queryset.filter(gm_approved_by__isnull=True, rejected_by__isnull=True, is_finalized=False)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        if request.user.role not in ["audit", "warehouse_admin", "manager"]:
            return Response({"detail": "Not authorized."}, status=403)

        cert = self.get_object()
        reason = request.data.get("reason")

        if not reason:
            return Response({"detail": "Rejection reason is required."}, status=status.HTTP_400_BAD_REQUEST)

        cert.rejection_reason = reason
        cert.rejected_by = request.user
        cert.is_finalized = False
        cert.audit_approved_by = None
        cert.admin_approved_by = None
        cert.gm_approved_by = None
        cert.save()

        return Response({"detail": "Certification rejected successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        cert = self.get_object()
        user = request.user
        role = user.role

        if role == "audit":
            cert.audit_approved_by = user
        elif role == "warehouse_admin":
            cert.admin_approved_by = user
        elif role == "manager":
            cert.gm_approved_by = user
        else:
            return Response({"detail": "Not authorized to approve."}, status=403)

        cert.rejection_reason = None
        cert.rejected_by = None

        if (
            cert.audit_approved_by is not None and
            cert.admin_approved_by is not None and
            cert.gm_approved_by is not None
        ):
            cert.is_finalized = True

        cert.save()
        return Response({"detail": "Certification approved successfully."}, status=200)
