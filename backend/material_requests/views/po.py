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
        queryset = PurchaseOrder.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        delivered = self.request.query_params.get("delivered")

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if delivered == "true":
            queryset = queryset.filter(
                deliveries__isnull=False,
                requisition_voucher__department__in=["engineering", "operations_maintenance"]
            ).exclude(quality_checks__isnull=False).distinct()
        else:
            queryset = queryset.exclude(deliveries__isnull=False)
            
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

        for item in items:
            item["delivery_date"] = delivery_date
            item["purchase_order"] = po.id

        serializer = DeliveryRecordSerializer(data=items, many=True)
        serializer.is_valid(raise_exception=True)

        DeliveryRecord.objects.bulk_create([
            DeliveryRecord(
                purchase_order=po,
                material=item["material"],
                delivered_quantity=item["delivered_quantity"],
                delivery_status=item["delivery_status"],
                delivery_date=item["delivery_date"],
                remarks=item.get("remarks", "")
            )
            for item in serializer.validated_data
        ])

        return Response({"message": "Delivery recorded successfully."}, status=201)
