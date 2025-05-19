from rest_framework import serializers
from ..models import PurchaseOrderItem, Material, PurchaseOrder, RequisitionVoucher
from authentication.models import User  # if needed
from inventory.serializers import MaterialSerializer
from .delivery import DeliveryRecordSerializer



class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)  # 👈 include full material info
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        source='material',
        write_only=True
    )
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'material', 'material_id', 'quantity', 'unit', 'unit_price', 'total'] 
        
          
class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)
    rv_id = serializers.PrimaryKeyRelatedField(
        queryset=RequisitionVoucher.objects.all(),
        source='requisition_voucher'
    )
    requisition_voucher = serializers.SerializerMethodField()
    # ✅ Add these two:
    vat_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    vat_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    deliveries = DeliveryRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'po_number',
            'rv_id',
            'requisition_voucher',
            'supplier',
            'supplier_address',
            'created_at',
            'status',
            'received_by',
            'delivery_date',
            'vat_rate',       
            'vat_amount',     
            'grand_total',
            'items',
            'deliveries',     
        ]

    def get_requisition_voucher(self, obj):
        rv = obj.requisition_voucher
        if rv:
            return {
                "id": rv.id,
                "rv_number": rv.rv_number,
                "department": rv.department
            }
        return None
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        vat_rate = validated_data.get('vat_rate', 0)

        po = PurchaseOrder.objects.create(**validated_data)

        subtotal = 0
        for item_data in items_data:
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']
            item_total = quantity * unit_price
            subtotal += item_total

            PurchaseOrderItem.objects.create(
                purchase_order=po,
                material=item_data['material'],
                quantity=quantity,
                unit=item_data['unit'],
                unit_price=unit_price,
                total=item_total
            )

        vat_amount = subtotal * (vat_rate / 100)
        po.vat_amount = vat_amount
        po.grand_total = subtotal + vat_amount
        po.save()

        return po



class PurchaseOrderApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = ['status', 'recommended_by', 'final_approved_by', 'rejection_reason']

    def update(self, instance, validated_data):
        status = validated_data.get("status")

        if status == "recommended":
            instance.status = "recommended"
            instance.recommended_by = self.context["request"].user
            instance.rejection_reason = None

        elif status == "approved":
            instance.status = "approved"
            instance.final_approved_by = self.context["request"].user
            instance.rejection_reason = None

        elif status == "rejected":
            instance.status = "rejected"
            instance.rejection_reason = validated_data.get("rejection_reason")
            instance.final_approved_by = self.context["request"].user

        instance.save()
        return instance
