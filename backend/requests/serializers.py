from rest_framework import serializers
from .models import (
    ChargeTicket, ChargeTicketItem,
    RequisitionVoucher, RequisitionItem, MaterialRequest,
    MaterialRequestItem,
)
from inventory.models import Material
from inventory.serializers import MaterialSerializer
from .utils import update_request_status
from notification.utils import send_notification


# -------------------------
# Material Request
# -------------------------
class MaterialRequestItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        source='material',
        write_only=True,
        required=False
    )
    custom_name = serializers.CharField(required=False, allow_blank=True)
    custom_unit = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = MaterialRequestItem
        fields = [
            'id',
            'material',         # display only
            'material_id',      # write for existing
            'custom_name',      # write for custom
            'custom_unit',      # write for custom
            'quantity',
            'unit',
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
            'id',
            'status',
            'requester',
            'department',
            'purpose',
            'created_at',
            'work_order_no',
            'manpower',
            'target_completion',
            'actual_completion',
            'duration',
            'requester_department',
            'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = MaterialRequest.objects.create(**validated_data)
        for item in items_data:
            MaterialRequestItem.objects.create(request=request, **item)
        return request

    def get_requester(self, obj):
        full_name = obj.requester.get_full_name()
        return full_name if full_name.strip() else obj.requester.username


# -------------------------
# Charge Ticket
# -------------------------
class ChargeTicketItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), source='material', write_only=True
    )

    class Meta:
        model = ChargeTicketItem
        fields = ['id', 'material', 'material_id', 'quantity', 'unit']


class ChargeTicketSerializer(serializers.ModelSerializer):
    items = ChargeTicketItemSerializer(many=True)
    material_request = serializers.PrimaryKeyRelatedField(
        queryset=MaterialRequest.objects.all(), required=True
    )

    class Meta:
        model = ChargeTicket
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        charge_ticket = ChargeTicket.objects.create(**validated_data)
        for item in items_data:
            ChargeTicketItem.objects.create(charge_ticket=charge_ticket, **item)

        update_request_status(charge_ticket.material_request)

        # ✅ Send notification to requester
        requester = charge_ticket.material_request.requester
        send_notification(
            user=requester,
            message=f"Your request #{charge_ticket.material_request.id} has been issued as a Charge Ticket."
        )

        return charge_ticket
# -------------------------
# Requisition Voucher
# -------------------------
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
        requisition = RequisitionVoucher.objects.create(**validated_data)
        for item in items_data:
            RequisitionItem.objects.create(requisition=requisition, **item)

        update_request_status(requisition.material_request)

        # ✅ Send notification to requester
        requester = requisition.material_request.requester
        send_notification(
            user=requester,
            message=f"Your request #{requisition.material_request.id} has been forwarded for requisition."
        )

        return requisition