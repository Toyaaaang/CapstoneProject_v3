from django.contrib import admin
from .models import (
    ChargeTicket,
    ChargeTicketItem,
    RequisitionVoucher,
    RequisitionItem,
    MaterialRequest,
    MaterialRequestItem,
    PurchaseOrder,
    PurchaseOrderItem,
    DeliveryRecord,
    QualityCheck,
    QualityCheckItem,
    Certification,
    CertifiedItem,
)

# Inline for MaterialRequestItem
class MaterialRequestItemInline(admin.TabularInline):
    model = MaterialRequestItem
    extra = 1

# Admin for MaterialRequest
@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'requester', 'department', 'created_at')  # Removed 'target_date'
    list_filter = ('department', 'created_at')  # Removed 'target_date'
    search_fields = ('requester__username', 'department')
    inlines = [MaterialRequestItemInline]

# Inline for ChargeTicketItem
class ChargeTicketItemInline(admin.TabularInline):
    model = ChargeTicketItem
    extra = 1

# Admin for ChargeTicket
@admin.register(ChargeTicket)
class ChargeTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'requester', 'department', 'status', 'created_at')
    list_filter = ('status', 'department', 'created_at')
    search_fields = ('requester__username', 'department')
    inlines = [ChargeTicketItemInline]

# Inline for RequisitionItem
class RequisitionItemInline(admin.TabularInline):
    model = RequisitionItem
    extra = 1

# Admin for RequisitionVoucher
@admin.register(RequisitionVoucher)
class RequisitionVoucherAdmin(admin.ModelAdmin):
    list_display = ('rv_number', 'requester', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('rv_number', 'requester__username')
    inlines = [RequisitionItemInline]
    
# Inline for PurchaseOrderItem
class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1

# Admin for PurchaseOrder
@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'supplier', 'requisition_voucher', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'supplier')
    search_fields = ('po_number', 'supplier')
    inlines = [PurchaseOrderItemInline]
    
# Inline for DeliveryRecord
class DeliveryRecordInline(admin.TabularInline):
    model = DeliveryRecord
    extra = 1
    
# Register DeliveryRecord separately as well (optional)
@admin.register(DeliveryRecord)
class DeliveryRecordAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'material', 'delivered_quantity', 'delivery_status', 'delivery_date', 'created_at')
    list_filter = ('delivery_status', 'delivery_date', 'created_at')
    search_fields = ('purchase_order__po_number', 'material__name')

# Inline for QualityCheckItem
class QualityCheckItemInline(admin.TabularInline):
    model = QualityCheckItem
    extra = 1

# Admin for QualityCheck
@admin.register(QualityCheck)
class QualityCheckAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'department', 'checked_by', 'created_at')
    list_filter = ('department', 'created_at')
    search_fields = ('purchase_order__po_number', 'department', 'checked_by__username')
    inlines = [QualityCheckItemInline]

# Optionally, register QualityCheckItem separately
@admin.register(QualityCheckItem)
class QualityCheckItemAdmin(admin.ModelAdmin):
    list_display = ('quality_check', 'po_item', 'requires_certification')
    list_filter = ('requires_certification',)
    search_fields = ('quality_check__purchase_order__po_number', 'po_item__material__name')

# Inline for CertifiedItem
class CertifiedItemInline(admin.TabularInline):
    model = CertifiedItem
    extra = 1

# Admin for Certification
@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'purchase_order', 'status', 'is_finalized', 'created_at')
    list_filter = ('status', 'is_finalized', 'created_at')
    search_fields = ('purchase_order__po_number',)
    inlines = [CertifiedItemInline]

# Optionally, register CertifiedItem separately
@admin.register(CertifiedItem)
class CertifiedItemAdmin(admin.ModelAdmin):
    list_display = ('certification', 'po_item', 'inspection_type')
    list_filter = ('inspection_type',)
    search_fields = ('certification__purchase_order__po_number', 'po_item__material__name')

