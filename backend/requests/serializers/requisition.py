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

    class Meta:
        model = RequisitionItem
        fields = ['id', 'material', 'material_id', 'quantity', 'unit']

class RequisitionVoucherSerializer(serializers.ModelSerializer):
    items = RequisitionItemSerializer(many=True)
    material_request = serializers.PrimaryKeyRelatedField(
        queryset=MaterialRequest.objects.all(), required=True
    )

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
