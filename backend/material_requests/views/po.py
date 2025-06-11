from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import PurchaseOrder, DeliveryRecord, PurchaseOrderItem
from ..serializers.po import PurchaseOrderSerializer, PurchaseOrderApprovalSerializer, PurchaseOrderVarianceReportSerializer
from ..serializers.delivery import DeliveryRecordSerializer
from decimal import Decimal
from notification.utils import send_notification

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by("-created_at")
    serializer_class = PurchaseOrderSerializer

    def get_queryset(self):
        queryset = PurchaseOrder.objects.order_by("-created_at")

        status_filter = self.request.query_params.get("status")
        delivered = self.request.query_params.get("delivered")
        department = self.request.query_params.get("department")

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if delivered == "true":
            queryset = queryset.filter(deliveries__isnull=False)
            if department:
                queryset = queryset.filter(
                    requisition_voucher__department__iexact=department
                )
                # Department-specific logic:
                if department.lower() in ["engineering", "operations"]:
                    # Exclude POs that already have QC/certification
                    queryset = queryset.exclude(quality_checks__isnull=False)
                # For finance, do NOT exclude those with QC/certification
            else:
                # If no department, keep old logic (optional)
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
        # Notify requester
        send_notification(
            user=po.requisition_voucher.material_request.requester,
            message=f"Your purchase order ({po.po_number}) has been recommended."
        )
        # Notify budget analyst (or next handler)
        send_notification(
            role="manager",
            message=f"Purchase order ({po.po_number}) has been recommended and is awaiting for your approval."
        )
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
        # Notify requester
        send_notification(
            user=po.requisition_voucher.material_request.requester,
            message=f"Your purchase order ({po.po_number}) has been approved by General Manager."
        )
        # Notify purchasing
        send_notification(
            role="warehouse_staff",
            message=f"Purchase order ({po.po_number}) has been approved and is ready for delivery receiving."
        )
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
        send_notification(
            user=po.requisition_voucher.material_request.requester,
            message=f"Your purchase order ({po.po_number}) has been rejected. Reason: {reason}"
        )
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

            # Find the ordered quantity for this item
            if item.get("material"):
                po_item = PurchaseOrderItem.objects.get(purchase_order=po, material_id=item["material"])
                ordered_qty = po_item.quantity
            else:
                # For custom items, you may need to match by name/unit
                po_item = PurchaseOrderItem.objects.get(purchase_order=po, custom_name=item["custom_name"])
                ordered_qty = po_item.quantity

            delivered_qty = item["delivered_quantity"]

            # Set status automatically
            if Decimal(delivered_qty) == Decimal(ordered_qty):
                status = "complete"
            elif Decimal(delivered_qty) == 0:
                status = "shortage"
            elif Decimal(delivered_qty) < Decimal(ordered_qty):
                status = "partial"
            else:
                # Optionally handle over-delivery
                status = "over"

            validated_records.append(
                DeliveryRecord(
                    purchase_order=po,
                    material_id=item.get("material"),
                    custom_name=item.get("custom_name"),
                    custom_unit=item.get("custom_unit"),
                    delivered_quantity=delivered_qty,
                    delivery_status=status,  # <-- Set here
                    delivery_date=delivery_date,
                    remarks=item.get("remarks", "")
                )
            )

        DeliveryRecord.objects.bulk_create(validated_records)
        po.status = "delivered"
        po.save()
        
        department = po.requisition_voucher.department.lower()

        # Notify requester
        send_notification(
            user=po.requisition_voucher.material_request.requester,
            message=f"Delivery for purchase order ({po.po_number}) has been recorded."
        )

        # Only notify warehouse staff for Engineering and Operations
        if department in ["engineering", "operations_maintenance"]:
            send_notification(
                role="warehouse_staff",
                message=f"Delivery for purchase order ({po.po_number}) is ready for quality checking."
            )

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

    @action(detail=False, methods=["post"], url_path="estimate")
    def estimate(self, request):
        items = request.data.get("items", [])
        result = {}

        for item in items:
            material_id = item.get("material_id")
            unit = item.get("unit")
            if not material_id:
                continue

            qs = PurchaseOrderItem.objects.filter(material_id=material_id, unit=unit)
            prices = list(qs.values_list("unit_price", flat=True).order_by("-id"))
            if prices:
                result[material_id] = {
                    "average": round(sum(prices) / len(prices), 2),
                    "last": float(prices[0]),
                    "min": float(min(prices)),
                    "max": float(max(prices)),
                    "count": len(prices),
                }
            else:
                result[material_id] = None

        return Response(result)

    @action(detail=True, methods=["get"], url_path="printable")
    def printable(self, request, pk=None):
        po = self.get_object()
        serializer = self.get_serializer(po)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="variance-report")
    def variance_report(self, request, pk=None):
        po = self.get_object()
        serializer = PurchaseOrderVarianceReportSerializer(po)
        return Response(serializer.data)
