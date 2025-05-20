from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils.timezone import now
from django.db import transaction
from django.db.models import Q, Count, F
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from django.http import HttpResponse

from ..models import ReceivingReport, DeliveryRecord
from ..serializers.delivery import DeliveryRecordSerializer
from ..serializers.rr import ReceivingReportSerializer
from inventory.models import Inventory, Material
from notification.utils import send_notification
from authentication.models import User


def get_certified_deliveries_ready_for_rr():
    return DeliveryRecord.objects.filter(
        receiving_report__isnull=True,
        purchase_order__quality_checks__isnull=False,
    ).annotate(
        num_cert_required=Count(
            "purchase_order__quality_checks__items",
            filter=Q(purchase_order__quality_checks__items__requires_certification=True),
            distinct=True
        ),
        num_certified=Count("purchase_order__certifications__items", distinct=True)
    ).filter(
        Q(num_cert_required=0) | Q(num_cert_required=F("num_certified"))
    )


class ReceivingReportViewSet(viewsets.ModelViewSet):
    queryset = ReceivingReport.objects.all().order_by("-created_at")
    serializer_class = ReceivingReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReceivingReport.objects.all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        report = self.get_object()

        if report.is_approved:
            return Response({"detail": "Already approved."}, status=400)

        report.is_approved = True
        report.approved_by = request.user
        report.approved_at = now()
        report.save()

        department = report.delivery_record.purchase_order.requisition_voucher.department

        with transaction.atomic():
            for item in report.items.all():
                material = item.material

                inventory, created = Inventory.objects.get_or_create(
                    material=material,
                    department=department,
                    defaults={"quantity": item.quantity}
                )
                if not created:
                    inventory.quantity += item.quantity
                inventory.save()

        # ✅ Notify Finance and Managers
        finance_users = User.objects.filter(role="finance")
        manager_users = User.objects.filter(role="manager")
        recipients = finance_users.union(manager_users)

        for user in recipients:
            send_notification(
                user=user,
                message=f"Receiving Report for PO {report.purchase_order.po_number} has been approved.",
                link=f"/receiving-reports/{report.id}"
            )

        return Response({"detail": "Receiving report approved, inventory updated, and notifications sent."}, status=200)

    @action(detail=False, methods=["get"], url_path="deliveries")
    def deliveries_for_receiving(self, request):
        deliveries = get_certified_deliveries_ready_for_rr().filter(
            receiving_report__isnull=True  # ✅ Exclude those already reported
        ).select_related("purchase_order", "material")

        page = self.paginate_queryset(deliveries)
        if page is not None:
            serializer = DeliveryRecordSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = DeliveryRecordSerializer(deliveries, many=True)
        return Response(serializer.data)


    @action(detail=True, methods=["get"], url_path="download")
    def download_pdf(self, request, pk=None):
        report = self.get_object()

        if not report.is_approved:
            return Response({"detail": "Report not yet approved."}, status=400)

        template = get_template("receiving_report_template.html")
        html = template.render({"report": report})

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="RR-{report.purchase_order.po_number}.pdf"'

        pisa_status = pisa.CreatePDF(src=html, dest=response)

        if pisa_status.err:
            return Response({"detail": "Error generating PDF."}, status=500)

        return response

    @action(detail=False, methods=["get"], url_path="approved")
    def approved_reports(self, request):
        queryset = ReceivingReport.objects.filter(is_approved=True).select_related(
            "purchase_order", "created_by", "approved_by"
        ).order_by("-approved_at")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=["get"], url_path="unapproved")
    def unapproved_reports(self, request):
        queryset = ReceivingReport.objects.filter(is_approved=False).select_related(
            "purchase_order", "created_by", "delivery_record"
        ).prefetch_related("items")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

