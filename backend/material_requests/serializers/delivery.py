from rest_framework import serializers
from material_requests.models import DeliveryRecord, Material

class DeliveryRecordSerializer(serializers.ModelSerializer):
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        source="material",
        write_only=True
    )
    material = serializers.StringRelatedField(read_only=True)  # or use a nested serializer

    class Meta:
        model = DeliveryRecord
        fields = ['material', 'material_id', 'delivered_quantity', 'delivery_status', 'delivery_date', 'remarks']
