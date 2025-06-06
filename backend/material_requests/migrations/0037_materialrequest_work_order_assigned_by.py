# Generated by Django 5.1.7 on 2025-06-07 09:30

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0036_alter_materialrequest_status'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='materialrequest',
            name='work_order_assigned_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='work_orders_assigned', to=settings.AUTH_USER_MODEL),
        ),
    ]
