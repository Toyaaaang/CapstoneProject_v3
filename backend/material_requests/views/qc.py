from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import QualityCheck
from ..serializers.qc import QualityCheckSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

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
