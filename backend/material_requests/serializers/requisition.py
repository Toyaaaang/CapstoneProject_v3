from rest_framework import serializers
from ..models import RequisitionVoucher, RequisitionItem, MaterialRequest
from inventory.models import Material
from inventory.serializers import MaterialSerializer
from ..utils import update_request_status
from notification.utils import send_notification

class RequisitionItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), source='material', write_only=True
    )
    material_name = serializers.CharField(source="material.name", read_only=True)
    custom_name = serializers.CharField(required=False, allow_blank=True)
    custom_unit = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = RequisitionItem
        fields = ['id', 'material', 'material_id', 'quantity', 'unit', 'material_name'
                  , 'custom_name', 'custom_unit']

    def get_material_name(self, obj):
        if obj.material:
            return obj.material.name
        return obj.custom_name or "Custom Item"

    def validate(self, data):
        if not data.get('material') and not data.get('custom_name'):
            raise serializers.ValidationError("Either a material or custom name must be provided.")
        return data
    
class RequisitionVoucherSerializer(serializers.ModelSerializer):
    items = RequisitionItemSerializer(many=True)
    material_request = serializers.PrimaryKeyRelatedField(
        queryset=MaterialRequest.objects.all(), required=True
    )
    requester = serializers.SerializerMethodField()
    
    def get_requester(self, obj):
        return {
            "id": obj.requester.id,
            "first_name": obj.requester.first_name,
            "last_name": obj.requester.last_name,
        }

    class Meta:
        model = RequisitionVoucher
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        rv = RequisitionVoucher.objects.create(**validated_data)
        for item in items_data:
            RequisitionItem.objects.create(requisition=rv, **item)

        update_request_status(rv.material_request)
        send_notification(
            user=rv.material_request.requester,
            message=f"Your request #{rv.material_request.id} has been forwarded for requisition."
        )
        return rv
    
class RequisitionVoucherApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequisitionVoucher
        fields = ['status', 'recommended_by', 'final_approved_by', 'rejection_reason', 'rejected_by']

    def update(self, instance, validated_data):
        status = validated_data.get("status")

        if status == "rejected":
            instance.status = "rejected"
            instance.rejection_reason = validated_data.get("rejection_reason")
            instance.rejected_by = self.context['request'].user
        elif status == "recommended":
            instance.status = "recommended"
            instance.recommended_by = self.context['request'].user
            instance.rejection_reason = None
        elif status == "approved":
            instance.status = "approved"
            instance.final_approved_by = self.context['request'].user
            instance.rejection_reason = None

        instance.save()
        return instance

