# Generated by Django 5.1.7 on 2025-06-05 09:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0005_alter_material_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='visible',
            field=models.BooleanField(default=True),
        ),
    ]
