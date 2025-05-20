from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils.timezone import now

from ..models import ReceivingReport, ReceivingReportItem, DeliveryRecord
from ..serializers.delivery import DeliveryRecordSerializer
from ..serializers.rr import ReceivingReportSerializer
from inventory.models import Inventory, Material
from django.db import transaction

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
        report.is_approved = True
        report.approved_by = request.user
        report.save()

        department = report.delivery_record.purchase_order.requisition_voucher.department

        # ✅ Atomic update
        with transaction.atomic():
            for item in report.items.all():
                if item.material:
                    material = item.material
                else:
                    # ✅ Create material if it's a custom item
                    material, _ = Material.objects.get_or_create(
                        name=item.custom_name,
                        unit=item.custom_unit,
                        defaults={"description": "Auto-generated from Receiving Report"}
                    )
                    item.material = material
                    item.save()

                # ✅ Now update Inventory
                inventory, created = Inventory.objects.get_or_create(
                    material=material,
                    department=department,
                    defaults={"quantity": item.quantity}
                )
                if not created:
                    inventory.quantity += item.quantity
                inventory.save()

        return Response({"detail": "Receiving report approved and inventory updated."}, status=200)

    @action(detail=False, methods=["get"], url_path="deliveries")
    def deliveries_for_receiving(self, request):
        deliveries = DeliveryRecord.objects.filter(
            # optionally: certified items completed
        ).exclude(
            receiving_report__isnull=False  # ← this is the fix
        ).select_related("purchase_order", "material")

        page = self.paginate_queryset(deliveries)
        if page is not None:
            serializer = DeliveryRecordSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DeliveryRecordSerializer(deliveries, many=True)
        return Response(serializer.data)
