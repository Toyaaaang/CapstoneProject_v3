from rest_framework import serializers
from material_requests.models import DeliveryRecord, Material

class DeliveryRecordSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    # ✅ Replace StringRelatedField with full material object
    material = serializers.SerializerMethodField()
    purchase_order = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryRecord
        fields = [
            'id',
            'material',           # now returns { name, unit }
            'delivered_quantity',
            'delivery_status',
            'delivery_date',
            'remarks',
            'purchase_order'
        ]

    def get_material(self, obj):
        return {
            "name": obj.material.name,
            "unit": obj.material.unit
        }

    def get_purchase_order(self, obj):
        return {
            "po_number": obj.purchase_order.po_number
        }
