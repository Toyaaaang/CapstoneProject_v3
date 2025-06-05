from rest_framework import serializers
from .models import *

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())
    material_name = serializers.CharField(source='material.name', read_only=True)
    unit = serializers.CharField(source='material.unit')


    class Meta:
        model = Inventory
        fields = '__all__'
        
class InventorySummarySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='material.name')  # 🔄 was material_name
    unit = serializers.CharField(source='material.unit')

    class Meta:
        model = Inventory
        fields = ['name', 'unit', 'quantity',]

