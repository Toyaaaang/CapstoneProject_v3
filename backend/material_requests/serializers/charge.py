from rest_framework import serializers
from ..models import ChargeTicket, ChargeTicketItem, MaterialRequest
from inventory.models import Material
from inventory.serializers import MaterialSerializer
from ..utils import update_request_status
from notification.utils import send_notification

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
    requester = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    def get_requester(self, obj):
        return {
            "id": obj.requester.id,
            "first_name": obj.requester.first_name,
            "last_name": obj.requester.last_name,
        }

    def get_location(self, obj):
        if obj.material_request:
            return obj.material_request.location
        return None

    class Meta:
        model = ChargeTicket
        fields = '__all__'
       
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        ticket = ChargeTicket.objects.create(**validated_data)
        for item in items_data:
            ChargeTicketItem.objects.create(charge_ticket=ticket, **item)

        update_request_status(ticket.material_request)
        send_notification(
            user=ticket.material_request.requester,
            message=f"Your request #{ticket.material_request.id} has been issued as a Charge Ticket."
        )
        return ticket

class ChargeTicketPrintableSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    approvers = serializers.SerializerMethodField()
    requester_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    work_order_no = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    issued_by_signature = serializers.SerializerMethodField()
    work_order_assigner = serializers.SerializerMethodField()
    work_order_assigner_signature = serializers.SerializerMethodField()

    class Meta:
        model = ChargeTicket
        fields = [
            "id", "ic_no", "mc_no", "department", "purpose", "location", "created_at",
            "work_order_no", "issued_by_name", "issued_by_signature",
            "items", "approvers", "requester_name", "work_order_assigner", "work_order_assigner_signature",
        ]

    def get_items(self, obj):
        return [
            {
                "name": item.material.name,
                "unit": item.unit,
                "quantity": float(item.quantity),
            }
            for item in obj.items.all()
        ]

    def get_approvers(self, obj):
        approvers = []
        if obj.approved_by:
            approvers.append({
                "full_name": obj.approved_by.get_full_name(),
                "role": obj.approved_by.role,
                "signature": obj.approved_by.signature if obj.approved_by.signature else None,
            })
        if obj.issued_by:
            approvers.append({
                "full_name": obj.issued_by.get_full_name(),
                "role": obj.issued_by.role,
                "signature": obj.issued_by.signature if obj.issued_by.signature else None,
            })
        return approvers

    def get_requester_name(self, obj):
        return obj.requester.get_full_name()

    def get_location(self, obj):
        # Adjust this if your related field is named differently
        if obj.material_request:
            return obj.material_request.location
        return None

    def get_issued_by_name(self, obj):
        if obj.issued_by:
            return obj.issued_by.get_full_name()
        return None

    def get_issued_by_signature(self, obj):
        if obj.issued_by and obj.issued_by.signature:
            return obj.issued_by.signature
        return None

    def get_work_order_no(self, obj):
        if obj.material_request:
            return obj.material_request.work_order_no
        return None

    def get_work_order_assigner(self, obj):
        mr = obj.material_request
        if mr and mr.work_order_assigned_by:
            return mr.work_order_assigned_by.get_full_name()
        return None

    def get_work_order_assigner_signature(self, obj):
        mr = obj.material_request
        if mr and mr.work_order_assigned_by and mr.work_order_assigned_by.signature:
            return mr.work_order_assigned_by.signature
        return None
