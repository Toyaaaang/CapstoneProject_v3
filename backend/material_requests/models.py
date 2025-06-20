from uuid import uuid4
from django.db import models
from authentication.models import User
from inventory.models import Material
from django.utils.timezone import now

class MaterialRequest(models.Model):
    requester = models.ForeignKey(User, on_delete=models.CASCADE)
    department = models.CharField(
        max_length=50,
        choices=[
            ('engineering', 'Engineering'),
            ('operations_maintenance', 'Operations & Maintenance'),
            ('finance', 'Finance'),
        ]
    )
    purpose = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('won_assigned', 'Work Order Assigned'),
        ("in_progress", "In Progress"),
        ("completed", "Completed"), 
        ('charged', 'Charge Ticket Created'),
        ('ready_for_release', 'Ready for Release'),
        ('released', 'Released'),
        ('requisitioned', 'Requisition Voucher Created'),
        ('partially_fulfilled', 'Partially Fulfilled'),
        ('invalid', 'Invalid'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')

    rejection_reason = models.TextField(blank=True, null=True)

    # New fields for engineering/ops
    work_order_no = models.CharField(max_length=100, blank=True, null=True)
    manpower = models.CharField(max_length=255, blank=True, null=True)
    target_completion = models.DateField(blank=True, null=True)
    actual_completion = models.DateField(blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    location = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Finance-only field
    requester_department = models.CharField(max_length=100, blank=True, null=True)

    work_order_assigned_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="work_orders_assigned"
    )

    def save(self, *args, **kwargs):
        if not self.work_order_no and self.department in ['engineering', 'operations_maintenance']:
            date_str = now().strftime("%Y%m%d")
            dept_count = MaterialRequest.objects.filter(
                department=self.department,
                created_at__date=now().date()
            ).count() + 1
            prefix = "WO-ENG" if self.department == "engineering" else "WO-OPS"
            self.work_order_no = f"{prefix}-{date_str}-{dept_count:03d}"

        super().save(*args, **kwargs)

        
    def __str__(self):
        return f"Request #{self.id} by {self.requester.username} to {self.department}"
    
class MaterialRequestItem(models.Model):
    request = models.ForeignKey(MaterialRequest, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, blank=True, null=True)
    custom_name = models.CharField(max_length=255, blank=True, null=True)
    custom_unit = models.CharField(max_length=50, blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)

    def __str__(self):
        return (
            f"{self.material.name} (x{self.quantity})"
            if self.material else
            f"{self.custom_name} (custom) (x{self.quantity})"
        )


class BaseRequest(models.Model):
    REQUEST_ORIGIN = [
        ('employee', 'Employee'),
        ('sub_office', 'Sub Office'),
    ]

    requester = models.ForeignKey(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=50)
    purpose = models.TextField(blank=True, null=True)
    target_date = models.DateField(blank=True, null=True)
    manpower_requirements = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    origin = models.CharField(max_length=20, choices=REQUEST_ORIGIN)

    class Meta:
        abstract = True


class ChargeTicket(BaseRequest):
    ic_no = models.CharField(max_length=50, blank=True, null=True)
    mc_no = models.CharField(max_length=50, blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='charge_approver')
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='charge_issuer')
    material_request = models.ForeignKey(
    MaterialRequest, on_delete=models.CASCADE, related_name='charge_ticket', null=True, blank=True)

    rejection_reason = models.TextField(blank=True, null=True)
    approval_count = models.IntegerField(default=1)  # Evaluator auto-approves on creation
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("approved", "Fully Approved"),
            ("rejected", "Rejected"),
            ("released", "Released"),
        ],
        default="pending"
    )
    def save(self, *args, **kwargs):
        if self.department == "engineering" and not self.ic_no:
            self.ic_no = f"IC-{uuid4().hex[:6].upper()}"
        elif self.department == "operations_maintenance" and not self.mc_no:
            self.mc_no = f"MC-{uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


class ChargeTicketItem(models.Model):
    charge_ticket = models.ForeignKey(ChargeTicket, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)


class RequisitionVoucher(BaseRequest):
    rv_number = models.CharField(max_length=50, unique=True)
    evaluated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True , related_name='rv_evaluator')
    recommended_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True , related_name='rv_recommender')  # Budget Analyst
    final_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True , related_name='rv_gm_approver')
    material_request = models.ForeignKey(
    MaterialRequest, on_delete=models.CASCADE, related_name='requisition_voucher', null=True, blank=True)

    is_restocking = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)
    rejected_by = models.ForeignKey(
    'authentication.User',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='rejected_rvs'
)
    approval_count = models.IntegerField(default=1)  # Evaluator auto-approves
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('recommended', 'Recommended'),
            ('approved', 'Final Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    def save(self, *args, **kwargs):
        if not self.rv_number:
            self.rv_number = f"RV-{uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


class RequisitionItem(models.Model):
    requisition = models.ForeignKey(RequisitionVoucher, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    custom_name = models.CharField(max_length=255, blank=True, null=True)
    custom_unit = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return (
            f"{self.material.name} (x{self.quantity})"
            if self.material else
            f"{self.custom_name} (custom) (x{self.quantity})"
        )

class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=50, unique=True, blank=True)
    requisition_voucher = models.ForeignKey(RequisitionVoucher, on_delete=models.CASCADE, related_name='purchase_order')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    supplier_address = models.TextField()
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,blank=True, related_name='received_pos')
    delivery_date = models.DateField(null=True, blank=True)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)      
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('recommended', 'Recommended'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('delivered', 'Delivered'),
        ],
        default='pending'
    )
    recommended_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recommended_pos')
    final_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_pos')
    rejection_reason = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_pos'
    )
    
    def save(self, *args, **kwargs):
        if not self.po_number:
            self.po_number = f"PO-{uuid4().hex[:6].upper()}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.po_number} - {self.supplier}"
    
class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, blank=True, null=True)

    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)

    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    custom_name = models.CharField(max_length=255, blank=True, null=True)
    custom_unit = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return (
            f"{self.material.name} (x{self.quantity})"
            if self.material else
            f"{self.custom_name} (custom) (x{self.quantity})"
        )
        
    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class DeliveryRecord(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="deliveries")
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, blank=True)
    custom_name = models.CharField(max_length=255, blank=True, null=True)
    custom_unit = models.CharField(max_length=50, blank=True, null=True)

    delivered_quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    delivery_status = models.CharField(
        max_length=20,
        choices=[("complete", "Complete"), ("partial", "Partial"), ("shortage", "Shortage")]
    )
    delivery_date = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.material:
            return f"{self.material.name} delivered for {self.purchase_order.po_number}"
        return f"{self.custom_name or 'Custom Item'} delivered for {self.purchase_order.po_number}"

class QualityCheck(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='quality_checks')
    checked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    department = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"QC by {self.department} for {self.purchase_order.po_number}"


class QualityCheckItem(models.Model):
    quality_check = models.ForeignKey(QualityCheck, on_delete=models.CASCADE, related_name='items')
    po_item = models.ForeignKey(PurchaseOrderItem, on_delete=models.CASCADE)
    
    requires_certification = models.BooleanField(default=False)
    remarks = models.CharField(blank=True)

    def __str__(self):
        material = self.po_item.material.name if self.po_item.material else self.po_item.custom_name or "Custom Item"
        return f"QC for {material} — Cert Needed: {self.requires_certification}"


class Certification(models.Model):
    delivery_record = models.OneToOneField(DeliveryRecord, on_delete=models.CASCADE, related_name="certification", blank=True, null=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="certifications")
    created_at = models.DateTimeField(auto_now_add=True)

    inspected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="certifications_inspected")
    gm_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="certifications_gm_approved")
    audit_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="certifications_audit_approved")
    admin_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="certifications_admin_approved")

    STATUS_CHOICES = [
        ("started", "Started"),
        ("in_progress", "In Progress"),
        ("complete", "Complete"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="started")
    rejection_reason = models.CharField(max_length=100, blank=True, null=True)
    rejected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rejected_certifications"
    )
    is_finalized = models.BooleanField(default=False)  # Mark when all approvals are done
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Certification for {self.purchase_order.po_number if self.purchase_order else 'Unknown PO'}"

class CertifiedItem(models.Model):
    quality_check_item = models.OneToOneField(QualityCheckItem, on_delete=models.CASCADE, related_name="certifieditem")
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name="items")
    po_item = models.ForeignKey(PurchaseOrderItem, on_delete=models.CASCADE)
    remarks = models.CharField(max_length=255, blank=True)
    inspection_type = models.CharField(max_length=255, default="Brand Authenticity Specification Compliance")

    def __str__(self):
        name = self.po_item.material.name if self.po_item.material else self.po_item.custom_name or "Unnamed Item"
        return f"{name} - Cert ID {self.certification.id}"

class ReceivingReport(models.Model):
    purchase_order = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE, related_name="receiving_report")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="receiving_reports_created")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="receiving_reports_approved")
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    delivery_record = models.OneToOneField(
        DeliveryRecord,
        on_delete=models.CASCADE,
        related_name="receiving_report",
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"RR-{self.purchase_order.po_number}" if self.purchase_order else "Receiving Report"


class ReceivingReportItem(models.Model):
    receiving_report = models.ForeignKey(ReceivingReport, on_delete=models.CASCADE, related_name="items")
    po_item = models.ForeignKey(PurchaseOrderItem, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        name = self.material.name if self.material else self.po_item.custom_name or "Custom Item"
        return f"{name} in RR-{self.receiving_report.purchase_order.po_number}"
