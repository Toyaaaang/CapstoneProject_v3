
from django.contrib import admin
from .models import Accountability, AccountabilityItem

class AccountabilityItemInline(admin.TabularInline):
    model = AccountabilityItem
    extra = 0
    readonly_fields = ("material", "quantity", "unit", "charge_ticket")

@admin.register(Accountability)
class AccountabilityAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "department", "created_at")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    list_filter = ("department", "created_at")
    inlines = [AccountabilityItemInline]

@admin.register(AccountabilityItem)
class AccountabilityItemAdmin(admin.ModelAdmin):
    list_display = ("material", "quantity", "unit", "accountability", "charge_ticket")
    search_fields = ("material__name",)
    list_filter = ("unit",)
