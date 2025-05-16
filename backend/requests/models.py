from uuid import uuid4
from django.db import models
from authentication.models import User
from inventory.models import Material

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
        ('charged', 'Charge Ticket Created'),
        ('requisitioned', 'Requisition Voucher Created'),
        ('partially_fulfilled', 'Partially Fulfilled'),
        ('invalid', 'Invalid'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')


    # New fields for engineering/ops
    work_order_no = models.CharField(max_length=100, blank=True, null=True)
    manpower = models.CharField(max_length=255, blank=True, null=True)
    target_completion = models.DateField(blank=True, null=True)
    actual_completion = models.DateField(blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)

    # Finance-only field
    requester_department = models.CharField(max_length=100, blank=True, null=True)

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
    evaluated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rv_evaluator')
    recommended_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rv_recommender')  # Budget Analyst
    final_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rv_gm_approver')
    material_request = models.ForeignKey(
    MaterialRequest, on_delete=models.CASCADE, related_name='requisition_voucher', null=True, blank=True)

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
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
