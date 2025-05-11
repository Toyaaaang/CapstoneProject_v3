from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit')
    search_fields = ('name',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('material', 'department', 'quantity', 'updated_at')
    list_filter = ('department',)