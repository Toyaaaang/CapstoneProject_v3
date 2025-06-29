from rest_framework import serializers
from .models import Accountability, AccountabilityItem
from inventory.serializers import MaterialSerializer  # reuse if exists
from material_requests.models import ChargeTicket

class ChargeTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargeTicket
        fields = ["id", "ic_no", "mc_no"]

class AccountabilityItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    charge_ticket = ChargeTicketSerializer(read_only=True)  # <-- use nested serializer

    class Meta:
        model = AccountabilityItem
        fields = ["material", "quantity", "unit", "charge_ticket"]

class AccountabilitySerializer(serializers.ModelSerializer):
    items = AccountabilityItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    department = serializers.CharField()
    

    class Meta:
        model = Accountability
        fields = ["id", "user", "department", "created_at", "items"]
    
    def get_user(self, obj):
        return obj.user.get_full_name() or obj.user.username

