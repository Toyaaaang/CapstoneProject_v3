from rest_framework import serializers
from .models import *

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'
        
class InventorySummarySerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name')
    unit = serializers.CharField(source='material.unit')

    class Meta:
        model = Inventory
        fields = ['material_name', 'unit', 'quantity', 'department']
