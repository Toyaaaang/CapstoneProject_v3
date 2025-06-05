from django.db import models

class Material(models.Model):
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=50)
    CATEGORY_CHOICES = [
        ("wiring", "Wiring and Conductors"),
        ("poles", "Poles and Supports"),
        ("metering", "Metering Equipment"),
        ("transformers", "Transformers and Substations Equipment"),
        ("hardware", "Hardware and Fasteners"),
        ("safety", "Safety Equipment"),
        ("tools", "Tools and Accessories"),
        ("office_supply", "Office Supplies"),
        ("uncategorized", "Uncategorized"),
    ]
    category = models.CharField(
        max_length=32,
        choices=CATEGORY_CHOICES,
        default="uncategorized"
    )
    description = models.TextField(blank=True, null=True)
    visible = models.BooleanField(default=True) 

    def __str__(self):
        return self.name


class Inventory(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    # department = models.CharField(
    #     max_length=50,
    #     choices=[
    #         ('engineering', 'Engineering'),
    #         ('operations_maintenance', 'Operations & Maintenance'),
    #         ('finance', 'Finance'),
    #     ]
    # )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('material',)

    def __str__(self):
        return f"{self.material.name}"
