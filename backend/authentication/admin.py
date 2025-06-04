from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, RoleRequestRecord  # add RoleRequestRecord

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'is_role_confirmed', 'signature', 'department', 'suboffice', 'id_image_url')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(RoleRequestRecord)  # register RoleRequestRecord
