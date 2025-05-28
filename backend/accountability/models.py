from django.db import models
from authentication.models import User
from inventory.models import Material
from material_requests.models import ChargeTicket

class Accountability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    department = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"

class AccountabilityItem(models.Model):
    accountability = models.ForeignKey(Accountability, on_delete=models.CASCADE, related_name="items")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    charge_ticket = models.ForeignKey(ChargeTicket, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.material.name} – {self.quantity} {self.unit}"
