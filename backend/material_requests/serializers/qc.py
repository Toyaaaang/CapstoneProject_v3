from rest_framework import serializers
from ..models import QualityCheck, QualityCheckItem, PurchaseOrderItem, PurchaseOrder, RequisitionVoucher
from material_requests.serializers.po import PurchaseOrderSerializer, PurchaseOrderItemSerializer
from material_requests.serializers.requisition import RequisitionVoucherSerializer

# --- Nested serializer for read-only use in QualityCheckItem ---
class NestedQualityCheckSerializer(serializers.ModelSerializer):
    purchase_order = serializers.SerializerMethodField()
    requisition_voucher = serializers.SerializerMethodField()

    class Meta:
        model = QualityCheck
        fields = ['purchase_order', 'requisition_voucher']

    def get_purchase_order(self, obj):
        po = obj.purchase_order

        # Optionally get the first DeliveryRecord (global)
        first_delivery = po.deliveries.first()
        return {
            "po_number": po.po_number,
            "delivery_date": first_delivery.delivery_date if first_delivery else None
        }

    def get_requisition_voucher(self, obj):
        rv = obj.purchase_order.requisition_voucher
        return {
            "rv_number": rv.rv_number,
            "department": rv.department
        } if rv else None


# --- Serializer for each Quality Check Item ---
class QualityCheckItemSerializer(serializers.ModelSerializer):
    po_item = PurchaseOrderItemSerializer(read_only=True)
    po_item_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrderItem.objects.all(),
        source='po_item',
        write_only=True
    )
    quality_check = NestedQualityCheckSerializer(read_only=True)
    delivery_record_id = serializers.SerializerMethodField()

    class Meta:
        model = QualityCheckItem
        fields = [
            'id',
            'po_item_id',
            'po_item',
            'requires_certification',
            'remarks',
            'quality_check',
            'delivery_record_id',
        ]
    def get_delivery_record_id(self, obj):
        deliveries = obj.quality_check.purchase_order.deliveries
        item = obj.po_item

        if item.material:
            # Match by stock material
            match = deliveries.filter(material=item.material).first()
        else:
            # Match by custom name (case-insensitive to be safer)
            match = deliveries.filter(custom_name__iexact=item.custom_name).first()

        return match.id if match else None

# --- Serializer for creating a full Quality Check with items ---
class QualityCheckSerializer(serializers.ModelSerializer):
    items = QualityCheckItemSerializer(many=True)
    purchase_order_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrder.objects.all(),
        source='purchase_order'
    )
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    supplier = serializers.CharField(source='purchase_order.supplier', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = QualityCheck
        fields = [
            'purchase_order_id',
            'items',
            'po_number',
            'supplier',
            'checked_by',
            'department',
            'created_at',
            
        ]
        read_only_fields = ['checked_by', 'department']

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
