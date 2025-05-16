from rest_framework import serializers
from ..models import PurchaseOrderItem, Material, PurchaseOrder, RequisitionVoucher
from authentication.models import User  # if needed

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), source='material'
    )

    class Meta:
        model = PurchaseOrderItem
        fields = ['material_id', 'quantity', 'unit', 'unit_price']
        
class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)
    rv_id = serializers.PrimaryKeyRelatedField(
        queryset=RequisitionVoucher.objects.all(),
        source='requisition_voucher'
    )

    class Meta:
        model = PurchaseOrder
        fields = ['rv_id', 'supplier', 'supplier_address', 'received_by', 'delivery_date', 'grand_total', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        po = PurchaseOrder.objects.create(**validated_data)

        total = 0
        for item_data in items_data:
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']
            item_total = quantity * unit_price
            total += item_total
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                material=item_data['material'],
                quantity=quantity,
                unit=item_data['unit'],
                unit_price=unit_price,
                total=item_total
            )

        po.grand_total = total
        po.save()

        return po
