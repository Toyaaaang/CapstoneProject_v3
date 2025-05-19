from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils.timezone import now

from ..models import ReceivingReport, ReceivingReportItem
from ..serializers.rr import ReceivingReportSerializer
from inventory.models import Inventory, Material

class ReceivingReportViewSet(viewsets.ModelViewSet):
    queryset = ReceivingReport.objects.all().order_by("-created_at")
    serializer_class = ReceivingReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
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

        # ✅ Update inventory
        for item in report.items.all():
            inventory, created = Inventory.objects.get_or_create(
                material=item.material,
                defaults={"quantity": 0, "unit": item.unit}
            )
            inventory.quantity += item.quantity
            inventory.save()

        return Response({"detail": "Receiving report approved and inventory updated."}, status=200)
