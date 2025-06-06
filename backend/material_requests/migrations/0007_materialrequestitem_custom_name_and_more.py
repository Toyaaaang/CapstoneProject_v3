# Generated by Django 5.1.7 on 2025-05-08 08:19

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
        ('requests', '0006_alter_materialrequest_department'),
    ]

    operations = [
        migrations.AddField(
            model_name='materialrequestitem',
            name='custom_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='materialrequestitem',
            name='custom_unit',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='materialrequestitem',
            name='material',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='inventory.material'),
        ),
    ]
