from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit')
    search_fields = ('name',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('material', 'quantity', 'category', 'updated_at')

    def category(self, obj):
        return obj.material.get_category_display()
    category.admin_order_field = 'material__category'
    category.short_description = 'Category'