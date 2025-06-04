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
        ('operations_maintenance', 'Operations & Maintenance'),
        ('budget_analyst', 'Budget Analyst'),
        ('sub_office', 'Sub Office'),
        ('finance', 'Finance'),      
        ('audit', 'Audit'),
    )
    DEPARTMENT_CHOICES = (
        ('engineering', 'Engineering'),
        ('operations_maintenance', 'Operations & Maintenance'),
        ('finance', 'Finance'),
        ('admin', 'Admin'),
        
    )

    SUBOFFICE_CHOICES = (
        ('sub_office_a', 'Sub Office A'),
        ('sub_office_b', 'Sub Office B'),
        ('sub_office_c', 'Sub Office C'),
    )
    
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='employee')
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    suboffice = models.CharField(max_length=50, choices=SUBOFFICE_CHOICES, null=True, blank=True)
    is_role_confirmed = models.BooleanField(default=False)
    signature = models.FileField(upload_to='signatures/', null=True, blank=True)  
    email = models.EmailField(unique=True)
    id_image_url = models.URLField(null=True, blank=True)

    
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
