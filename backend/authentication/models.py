from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('warehouse_admin', 'Warehouse Admin'),
        ('warehouse_staff', 'Warehouse Staff'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('engineering', 'Engineering'),
        ('operations_maintenance', 'Operations Maintenance'),
        ('budget_analyst', 'Budget Analyst'),
        ('sub_office', 'Sub Office'),
        ('finance', 'Finance'),      
        ('audit', 'Audit'),
    )
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='employee')
    is_role_confirmed = models.BooleanField(default=False)
    signature = models.FileField(upload_to='signatures/', null=True, blank=True)  
    
    def __str__(self):
        return self.username


class RoleRequestRecord(models.Model):
    STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_role = models.CharField(max_length=50)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="processed_requests")
    processed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status} - {self.requested_role}"
