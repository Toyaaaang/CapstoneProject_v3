from rest_framework import serializers
from ..models import ReceivingReport, ReceivingReportItem
from material_requests.models import PurchaseOrder, PurchaseOrderItem
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

    class Meta:
        model = ReceivingReport
        fields = [
            "id",
            "purchase_order_id",
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
        user = self.context["request"].user
        rr = ReceivingReport.objects.create(created_by=user, **validated_data)

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

