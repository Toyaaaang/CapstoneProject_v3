# Generated by Django 5.1.7 on 2025-05-19 11:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0021_certification_certifieditem'),
    ]

    operations = [
        migrations.AddField(
            model_name='certification',
            name='delivery_record',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='certification', to='requests.deliveryrecord'),
        ),
    ]
