from rest_framework import serializers
from ..models import ReceivingReport, ReceivingReportItem
from material_requests.models import PurchaseOrder, PurchaseOrderItem, DeliveryRecord
from inventory.models import Material


class ReceivingReportItemSerializer(serializers.ModelSerializer):
    po_item_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrderItem.objects.all(),
        source='po_item',
        write_only=True
    )
    material_name = serializers.CharField(source="material.name", read_only=True)
    unit = serializers.CharField(read_only=True)

    class Meta:
        model = ReceivingReportItem
        fields = [
            "id",
            "po_item_id",
            "material",
            "material_name",
            "quantity",
            "unit",
            "remarks",
        ]


class ReceivingReportSerializer(serializers.ModelSerializer):
    items = ReceivingReportItemSerializer(many=True)
    purchase_order_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
        source="purchase_order"
    )
    delivery_record = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryRecord.objects.all()
    )
    po_number = serializers.CharField(source="purchase_order.po_number", read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)  # optional pretty username
    approved_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ReceivingReport
        fields = [
            "id",
            "po_number",  
                   
            "purchase_order_id",
            "delivery_record",            # ✅ Include in fields
            "created_by",
            "approved_by",
            "created_at",
            "approved_at",
            "is_approved",
            "remarks",
            "items"
        ]
        read_only_fields = ["created_by", "approved_by", "created_at", "approved_at", "is_approved"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        validated_data["created_by"] = self.context["request"].user

        rr = ReceivingReport.objects.create(**validated_data)  # ✅ now includes delivery_record

        for item_data in items_data:
            po_item = item_data["po_item"]
            ReceivingReportItem.objects.create(
                receiving_report=rr,
                material=item_data.get("material") or po_item.material,
                po_item=po_item,
                quantity=item_data["quantity"],
                unit=po_item.unit,
                remarks=item_data.get("remarks", "")
            )

        return rr
