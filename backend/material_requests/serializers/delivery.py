from rest_framework import serializers
from material_requests.models import DeliveryRecord, PurchaseOrderItem
from inventory.models import Material
from material_requests.models import PurchaseOrder


class DeliveryRecordSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), required=False, allow_null=True
    )
    purchase_order = serializers.PrimaryKeyRelatedField(queryset=PurchaseOrder.objects.all())
    material_name = serializers.SerializerMethodField()

    custom_name = serializers.CharField(required=False, allow_blank=True)
    custom_unit = serializers.CharField(required=False, allow_blank=True)

    # ✅ Optional read-only fields
    material_details = serializers.SerializerMethodField()
    purchase_order_details = serializers.SerializerMethodField()
    po_item = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryRecord
        fields = [
            "id",
            "material",
            "custom_name",
            "custom_unit",
            "delivered_quantity",
            "delivery_status",
            "delivery_date",
            "remarks",
            "purchase_order",
            "po_item",
            "material_details",
            "purchase_order_details",
            "material_name"
        ]

    def get_material_name(self, obj):
        return obj.material.name if obj.material else obj.custom_name

    def get_material_details(self, obj):
        if obj.material:
            return {
                "id": obj.material.id,
                "name": obj.material.name,
                "unit": obj.material.unit
            }
        return {
            "name": obj.custom_name or "Custom Item",
            "unit": obj.custom_unit or ""
        }


    def get_purchase_order_details(self, obj):
        return {
            "id": obj.purchase_order.id,
            "po_number": obj.purchase_order.po_number
        }

    def get_po_item(self, obj):
        try:
            item = obj.purchase_order.items.filter(material=obj.material).first()
            return item.id if item else None
        except Exception as e:
            print(f"[DeliveryRecordSerializer] po_item error: {e}")
            return None


    def validate(self, data):
        material = data.get("material")
        custom_name = data.get("custom_name")
        custom_unit = data.get("custom_unit")

        # Must provide either material or custom_name, not both
        if not material and not custom_name:
            raise serializers.ValidationError("Either 'material' or 'custom_name' must be provided.")
        if material and custom_name:
            raise serializers.ValidationError("Provide either 'material' or 'custom_name', not both.")

        if not material and not custom_unit:
            raise serializers.ValidationError("Custom items must include 'custom_unit'.")

        if data.get("delivered_quantity", 0) <= 0:
            raise serializers.ValidationError("Delivered quantity must be greater than zero.")

        if material:
            po = data.get("purchase_order")
            if not PurchaseOrderItem.objects.filter(purchase_order=po, material=material).exists():
                raise serializers.ValidationError("This material is not part of the selected purchase order.")

        return data
