from rest_framework import serializers
from ..models import Certification, CertifiedItem, PurchaseOrderItem, PurchaseOrder


class CertifiedItemSerializer(serializers.ModelSerializer):
    po_item_id = serializers.PrimaryKeyRelatedField(
        queryset=PurchaseOrderItem.objects.all(),
        source="po_item",
        write_only=True
    )
    material_name = serializers.SerializerMethodField()
    quantity = serializers.DecimalField(source="po_item.quantity", max_digits=10, decimal_places=2, read_only=True)
    unit = serializers.SerializerMethodField()

    class Meta:
        model = CertifiedItem
        fields = ["po_item_id", "material_name", "quantity", "unit", "remarks", "inspection_type"]

    def get_material_name(self, obj):
        if obj.po_item.material:
            return obj.po_item.material.name
        return obj.po_item.custom_name or "Custom Item"

    def get_unit(self, obj):
        if obj.po_item.material:
            return obj.po_item.unit
        return obj.po_item.custom_unit or "-"

class CertificationSerializer(serializers.ModelSerializer):
    items = CertifiedItemSerializer(many=True, read_only=True)
    purchase_order = serializers.SerializerMethodField()
    delivery_record = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "purchase_order",
            "delivery_record",
            "items",
            "created_at",
            "remarks",
            "is_finalized",
        ]

    def get_purchase_order(self, obj):
        return {
            "po_number": obj.purchase_order.po_number
        } if obj.purchase_order else None

    def get_delivery_record(self, obj):
        return {
            "delivery_date": obj.delivery_record.delivery_date
        } if obj.delivery_record else None

class CertificationPrintableSerializer(serializers.ModelSerializer):
    items = CertifiedItemSerializer(many=True, read_only=True)
    purchase_order = serializers.SerializerMethodField()
    delivery_record = serializers.SerializerMethodField()
    signatories = serializers.SerializerMethodField()
    supplier = serializers.SerializerMethodField()
    supplier_address = serializers.SerializerMethodField()
    requisition_voucher = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "purchase_order",
            "delivery_record",
            "items",
            "created_at",
            "remarks",
            "is_finalized",
            "signatories",
            "supplier",
            "supplier_address",
            "requisition_voucher",
            "purpose",
        ]

    def get_purchase_order(self, obj):
        if obj.purchase_order:
            return {
                "po_number": obj.purchase_order.po_number
            }
        return None

    def get_supplier(self, obj):
        if obj.purchase_order and obj.purchase_order.supplier:
            return obj.purchase_order.supplier.name
        return None

    def get_supplier_address(self, obj):
        if obj.purchase_order and obj.purchase_order.supplier_address:
            return obj.purchase_order.supplier_address
        return None

    def get_requisition_voucher(self, obj):
        # Get RV number from the related requisition voucher
        if obj.purchase_order and obj.purchase_order.requisition_voucher:
            return {
                "rv_number": obj.purchase_order.requisition_voucher.rv_number
            }
        return None

    def get_purpose(self, obj):
        # Try to get purpose from the requisition voucher, fallback to PO or blank
        if obj.purchase_order and obj.purchase_order.requisition_voucher and obj.purchase_order.requisition_voucher.purpose:
            return obj.purchase_order.requisition_voucher.purpose
        elif obj.purchase_order and hasattr(obj.purchase_order, "purpose"):
            return obj.purchase_order.purpose
        return None

    def get_delivery_record(self, obj):
        return {
            "delivery_date": obj.delivery_record.delivery_date
        } if obj.delivery_record else None

    def get_signatories(self, obj):
        signatories = []
        if obj.inspected_by:
            signatories.append({
                "role": "Inspected",
                "full_name": obj.inspected_by.get_full_name() or obj.inspected_by.username,
                "signature": getattr(obj.inspected_by, "signature", None),
            })
        if obj.audit_approved_by:
            signatories.append({
                "role": "Audit",
                "full_name": obj.audit_approved_by.get_full_name() or obj.audit_approved_by.username,
                "signature": getattr(obj.audit_approved_by, "signature", None),
            })
        if obj.admin_approved_by:
            signatories.append({
                "role": "Warehouse Admin",
                "full_name": obj.admin_approved_by.get_full_name() or obj.admin_approved_by.username,
                "signature": getattr(obj.admin_approved_by, "signature", None),
            })
        if obj.gm_approved_by:
            signatories.append({
                "role": "General Manager",
                "full_name": obj.gm_approved_by.get_full_name() or obj.gm_approved_by.username,
                "signature": getattr(obj.gm_approved_by, "signature", None),
            })
        return signatories
