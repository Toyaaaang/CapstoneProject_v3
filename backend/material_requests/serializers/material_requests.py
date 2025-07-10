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
    charge_ticket_id = serializers.SerializerMethodField()  # <-- Add this line

    # Add these fields
    location = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    
    class Meta:
        model = MaterialRequest
        fields = [
            'id', 'status', 'requester', 'department', 'purpose', 'created_at',
            'work_order_no', 'manpower', 'target_completion', 'actual_completion',
            'duration', 'requester_department', 'items', 'location', 'latitude',
            'longitude', 'charge_ticket_id'  
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

    def get_charge_ticket_id(self, obj):
        # If it's a reverse relation (one-to-many or one-to-one)
        # Try to get the first related charge ticket
        if hasattr(obj, "charge_ticket"):
            # If it's a RelatedManager (many), use .first()
            related = getattr(obj, "charge_ticket")
            if hasattr(related, "all"):
                ct = related.all().first()
                if ct:
                    return ct.id
            # If it's a single object (one-to-one), just return its id
            elif hasattr(related, "id"):
                return related.id
        # Or if it's a reverse relation with default related_name
        if hasattr(obj, "chargeticket_set"):
            ct = obj.chargeticket_set.first()
            if ct:
                return ct.id
        return None

class WorkOrderAssignmentSerializer(serializers.ModelSerializer):
    work_order_assigned_by = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MaterialRequest
        fields = ['work_order_no', 'manpower', 'target_completion', 'actual_completion', 'duration', 'work_order_assigned_by']

    def get_work_order_assigned_by(self, obj):
        if obj.work_order_assigned_by:
            return {
                "id": obj.work_order_assigned_by.id,
                "first_name": obj.work_order_assigned_by.first_name,
                "last_name": obj.work_order_assigned_by.last_name,
            }
        return None

    def assign_work_order(self, request, pk):
        request_obj = self.get_object(pk)
        prev_status = request_obj.status  # Save previous status
        serializer = self.__class__(request_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Only set status if it was pending before
        if prev_status == "pending":
            request_obj.status = "won_assigned"
        # Always set who assigned
        request_obj.work_order_assigned_by = request.user
        request_obj.save()
        return request_obj
