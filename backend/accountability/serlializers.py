from rest_framework import serializers
from .models import Accountability, AccountabilityItem
from inventory.serializers import MaterialSerializer  # reuse if exists

class AccountabilityItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)

    class Meta:
        model = AccountabilityItem
        fields = ["material", "quantity", "unit", "charge_ticket"]

class AccountabilitySerializer(serializers.ModelSerializer):
    items = AccountabilityItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Accountability
        fields = ["id", "user", "department", "created_at", "items"]
    
    def get_user(self, obj):
        return obj.user.get_full_name() or obj.user.username