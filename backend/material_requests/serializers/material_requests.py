from rest_framework import serializers
from ..models import MaterialRequest, MaterialRequestItem
from inventory.models import Material
from inventory.serializers import MaterialSerializer

class MaterialRequestItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), source='material', write_only=True, required=False
    )
    custom_name = serializers.CharField(required=False, allow_blank=True)
    custom_unit = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = MaterialRequestItem
        fields = [
            'id', 'material', 'material_id', 'custom_name', 'custom_unit',
            'quantity', 'unit',
        ]

    def validate(self, data):
        if not data.get('material') and not data.get('custom_name'):
            raise serializers.ValidationError("Either material_id or custom_name is required.")
        return data

class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requester = serializers.SerializerMethodField()

    class Meta:
        model = MaterialRequest
        fields = [
            'id', 'status', 'requester', 'department', 'purpose', 'created_at',
            'work_order_no', 'manpower', 'target_completion', 'actual_completion',
            'duration', 'requester_department', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        req = MaterialRequest.objects.create(**validated_data)
        for item in items_data:
            MaterialRequestItem.objects.create(request=req, **item)
        return req

    def get_requester(self, obj):
        return {
            "id": obj.requester.id,
            "first_name": obj.requester.first_name,
            "last_name": obj.requester.last_name,
        }