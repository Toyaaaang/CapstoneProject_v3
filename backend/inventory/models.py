from django.db import models

class Material(models.Model):
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Inventory(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    department = models.CharField(
        max_length=50,
        choices=[
            ('engineering', 'Engineering'),
            ('operations', 'Operations & Maintenance'),
            ('finance', 'Finance'),
        ]
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('material', 'department')

    def __str__(self):
        return f"{self.material.name} - {self.department}"
