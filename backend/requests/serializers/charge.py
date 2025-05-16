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
     
    def get_requester(self, obj):
        return {
            "id": obj.requester.id,
            "first_name": obj.requester.first_name,
            "last_name": obj.requester.last_name,
        }
    
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
