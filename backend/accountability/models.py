from django.db import models
from authentication.models import User
from inventory.models import Material
from requests.models import ChargeTicket

# models.py
class Accountability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class AccountabilityItem(models.Model):
    accountability = models.ForeignKey(Accountability, on_delete=models.CASCADE, related_name="items")
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    charge_ticket = models.ForeignKey(ChargeTicket, null=True, blank=True, on_delete=models.SET_NULL)
