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
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        allow_null=True,
        required=False
    )
    material_name = serializers.SerializerMethodField()
    unit = serializers.SerializerMethodField()

    custom_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    custom_unit = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
            "custom_name",
            "custom_unit"
        ]

    def get_material_name(self, obj):
        if obj.material:
            return obj.material.name
        return obj.po_item.custom_name or "Custom Item"

    def get_unit(self, obj):
        if obj.material:
            return obj.unit or obj.material.unit
        return obj.unit or obj.po_item.custom_unit or "-"


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
    created_by = serializers.StringRelatedField(read_only=True)
    approved_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ReceivingReport
        fields = [
            "id",
            "po_number",  
            "purchase_order_id",
            "delivery_record",
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
        validated_data["purchase_order"] = validated_data["delivery_record"].purchase_order

        rr = ReceivingReport.objects.create(**validated_data)

        for item_data in items_data:
            po_item = item_data["po_item"]
            material = item_data.get("material")
            custom_name = item_data.get("custom_name")
            custom_unit = item_data.get("custom_unit") or "-"

            if not material and custom_name:
                material, _ = Material.objects.get_or_create(
                    name=custom_name,
                    unit=custom_unit
                )

            final_unit = (
                custom_unit if not material else
                material.unit or po_item.custom_unit or "-"
            )

            ReceivingReportItem.objects.create(
                receiving_report=rr,
                material=material or po_item.material,
                po_item=po_item,
                quantity=item_data["quantity"],
                unit=final_unit,
                remarks=item_data.get("remarks", "")
            )

        return rr
