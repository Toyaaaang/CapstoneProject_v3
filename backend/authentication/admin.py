from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'is_role_confirmed', 'signature')}),
    )

admin.site.register(User, CustomUserAdmin)
