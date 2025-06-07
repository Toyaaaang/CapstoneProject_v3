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
    material_name = serializers.SerializerMethodField()
    is_custom = serializers.SerializerMethodField()

    class Meta:
        model = MaterialRequestItem
        fields = [
            'id', 'material', 'material_id', 'custom_name', 'custom_unit',
            'quantity', 'unit','material_name','is_custom'
        ]

    def validate(self, data):
        if not data.get('material') and not data.get('custom_name'):
            raise serializers.ValidationError("Either material_id or custom_name is required.")
        return data

    def get_material_name(self, obj):
        if obj.material:
            return obj.material.name
        return obj.custom_name or "Custom Item"

    def get_is_custom(self, obj):
        return obj.material is None
    
class MaterialRequestSerializer(serializers.ModelSerializer):
    items = MaterialRequestItemSerializer(many=True)
    requester = serializers.SerializerMethodField()

    # Add these fields
    location = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    
    class Meta:
        model = MaterialRequest
        fields = [
            'id', 'status', 'requester', 'department', 'purpose', 'created_at',
            'work_order_no', 'manpower', 'target_completion', 'actual_completion',
            'duration', 'requester_department', 'items','location', 'latitude',
            'longitude' 
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
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class WorkOrderAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialRequest
        fields = ['work_order_no', 'manpower', 'target_completion', 'actual_completion', 'duration']

    def assign_work_order(self, request, pk):
        request_obj = self.get_object(pk)
        serializer = self.__class__(request_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        request_obj.status = "won_assigned"
        request_obj.work_order_assigned_by = request.user  # <-- Save who assigned
        request_obj.save()
        return request_obj
