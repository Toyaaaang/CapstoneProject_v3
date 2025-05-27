from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import PurchaseOrder, DeliveryRecord
from ..serializers.po import PurchaseOrderSerializer, PurchaseOrderApprovalSerializer
from ..serializers.delivery import DeliveryRecordSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by("-created_at")
    serializer_class = PurchaseOrderSerializer

    def get_queryset(self):
        queryset = PurchaseOrder.objects.order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        delivered = self.request.query_params.get("delivered")
        department = self.request.query_params.get("department")  # 👈 NEW

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if delivered == "true":
            queryset = queryset.filter(deliveries__isnull=False)

            if department:
                queryset = queryset.filter(
                    requisition_voucher__department__iexact=department
                )
            queryset = queryset.exclude(quality_checks__isnull=False)

        elif delivered == "false":
            queryset = queryset.filter(deliveries__isnull=True)

        return queryset




    @action(detail=True, methods=["patch"], url_path="recommend")
    def recommend(self, request, pk=None):
        po = self.get_object()
        if po.status != "pending":
            return Response({"detail": "Only pending POs can be recommended."}, status=400)

        serializer = PurchaseOrderApprovalSerializer(
            po, data={"status": "recommended"}, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "PO recommended by Audit."}, status=200)

    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        po = self.get_object()
        if po.status != "recommended":
            return Response({"detail": "Only recommended POs can be approved."}, status=400)

        serializer = PurchaseOrderApprovalSerializer(
            po, data={"status": "approved"}, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "PO approved by GM."}, status=200)

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request, pk=None):
        po = self.get_object()
        reason = request.data.get("rejection_reason")
        if not reason:
            return Response({"detail": "Rejection reason is required."}, status=400)

        serializer = PurchaseOrderApprovalSerializer(
            po, data={"status": "rejected", "rejection_reason": reason}, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "PO rejected."}, status=200)

    
    @action(detail=True, methods=["post"], url_path="record-delivery")
    def record_delivery(self, request, pk=None):
        po = self.get_object()
        items = request.data.get("items")
        delivery_date = request.data.get("delivery_date")

        if not items or not delivery_date:
            return Response({"detail": "Items and delivery date are required."}, status=400)

        validated_records = []
        for item in items:
            item["delivery_date"] = delivery_date
            item["purchase_order"] = po.id

            # Basic validation
            if not item.get("material") and not item.get("custom_name"):
                return Response({"detail": "Each item must have a material or custom name."}, status=400)

            validated_records.append(
                DeliveryRecord(
                    purchase_order=po,
                    material_id=item.get("material"),  # can be None
                    custom_name=item.get("custom_name"),
                    custom_unit=item.get("custom_unit"),
                    delivered_quantity=item["delivered_quantity"],
                    delivery_status=item["delivery_status"],
                    delivery_date=delivery_date,
                    remarks=item.get("remarks", "")
                )
            )

        DeliveryRecord.objects.bulk_create(validated_records)
        po.status = "delivered"
        po.save()

        return Response({"message": "Delivery recorded successfully."}, status=201)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        pos = PurchaseOrder.objects.prefetch_related("items", "items__material").order_by("-created_at")

        data = []
        for po in pos:
            data.append({
                "id": po.id,
                "type": "PO",
                "reference_number": po.po_number,
                "supplier": po.supplier,
                "date": po.created_at,
                "total": po.grand_total,
                "status": po.status,
                "items": [
                    {
                        "material_name": item.material.name if item.material else None,
                        "custom_name": item.custom_name,
                        "quantity": item.quantity,
                        "unit": item.unit
                    }
                    for item in po.items.all()
                ]
            })

        # 🚧 Future: append purchase return records here as well

        return Response(data)
