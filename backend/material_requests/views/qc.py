from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import QualityCheck, QualityCheckItem
from ..serializers.qc import QualityCheckSerializer, QualityCheckItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import Certification

class QualityCheckViewSet(viewsets.ModelViewSet):
    queryset = QualityCheck.objects.all().order_by("-created_at")
    serializer_class = QualityCheckSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return QualityCheck.objects.filter(department=user.role).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            checked_by=self.request.user,
            department=self.request.user.role
        )

    @action(detail=True, methods=["post"], url_path="submit-qc")
    def submit_qc(self, request, pk=None):
        po = self.get_object()

        # Prevent duplicate QC for the same PO and department
        if QualityCheck.objects.filter(purchase_order=po, department=po.requisition_voucher.department).exists():
            return Response({"detail": "QC already submitted for this PO."}, status=400)

        serializer = QualityCheckSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "Quality Check submitted successfully."}, status=201)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        user = request.user
        queryset = QualityCheck.objects.filter(department=user.role).order_by("-created_at")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=["get"], url_path="certifiable-batches")
    def certifiable_batches(self, request):
        user = request.user
        user_department = user.role.lower() if user.role else None

        # Only include QCs with at least one item requiring certification and not yet certified
        qcs = QualityCheck.objects.filter(
            items__requires_certification=True,
            items__certifieditem__isnull=True,
        ).distinct()

        # Restrict to department if needed
        if user_department in ["engineering", "operations_maintenance"]:
            qcs = qcs.filter(department__iexact=user_department)

        qcs = qcs.prefetch_related(
            "items__po_item__material",
            "items__po_item",
            "purchase_order",
            "purchase_order__requisition_voucher"
        )

        # Paginate QCs
        page = self.paginate_queryset(qcs)
        if page is not None:
            serializer = QualityCheckSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = QualityCheckSerializer(qcs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
