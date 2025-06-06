# Generated by Django 5.1.7 on 2025-06-02 08:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notification', '0005_notification_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='role',
            field=models.CharField(blank=True, help_text='If set, this notification targets all users with this role', max_length=50, null=True),
        ),
    ]
