from rest_framework import serializers
from ..models import Certification, CertifiedItem, PurchaseOrderItem, PurchaseOrder


class CertifiedItemSerializer(serializers.ModelSerializer):
    po_item_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrderItem.objects.all(),
        source="po_item",
        write_only=True
    )
    material_name = serializers.CharField(source="po_item.material.name", read_only=True)
    quantity = serializers.DecimalField(source="po_item.quantity", max_digits=10, decimal_places=2, read_only=True)
    unit = serializers.CharField(source="po_item.unit", read_only=True)

    class Meta:
        model = CertifiedItem
        fields = ["po_item_id", "material_name", "quantity", "unit", "remarks", "inspection_type"]


class CertificationSerializer(serializers.ModelSerializer):
    items = CertifiedItemSerializer(many=True, read_only=True)
    purchase_order = serializers.SerializerMethodField()
    delivery_record = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "purchase_order",
            "delivery_record",
            "items",
            "created_at",
            "remarks",
            "is_finalized",
        ]

    def get_purchase_order(self, obj):
        return {
            "po_number": obj.purchase_order.po_number
        } if obj.purchase_order else None

    def get_delivery_record(self, obj):
        return {
            "delivery_date": obj.delivery_record.delivery_date
        } if obj.delivery_record else None
