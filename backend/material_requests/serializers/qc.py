from rest_framework import serializers
from ..models import QualityCheck, QualityCheckItem, PurchaseOrderItem, PurchaseOrder

class QualityCheckItemSerializer(serializers.ModelSerializer):
    po_item_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrderItem.objects.all(),
        source='po_item',
        write_only=True
    )

    class Meta:
        model = QualityCheckItem
        fields = ['po_item_id', 'requires_certification', 'remarks']

class QualityCheckSerializer(serializers.ModelSerializer):
    items = QualityCheckItemSerializer(many=True)
    purchase_order_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
        source='purchase_order'
    )

    class Meta:
        model = QualityCheck
        fields = ['purchase_order_id', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        po = validated_data['purchase_order']

        qc = QualityCheck.objects.create(
            purchase_order=po,
            checked_by=user,
            department=po.requisition_voucher.department
        )

        for item_data in items_data:
            QualityCheckItem.objects.create(quality_check=qc, **item_data)

        return qc
