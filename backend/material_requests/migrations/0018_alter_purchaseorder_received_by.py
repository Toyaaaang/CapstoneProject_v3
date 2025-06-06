# Generated by Django 5.1.7 on 2025-05-18 12:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0017_purchaseorder_vat_amount_purchaseorder_vat_rate'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorder',
            name='received_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_pos', to=settings.AUTH_USER_MODEL),
        ),
    ]
