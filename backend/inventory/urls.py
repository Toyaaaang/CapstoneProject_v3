from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ( MaterialListView, InventoryByDepartmentView, InventorySummaryViewSet, MaterialAdminViewSet, InventoryAdminViewSet, all_materials_view,
    InventorySummaryNoPageView )

router = DefaultRouter()
router.register(r'inventory-summary', InventorySummaryViewSet, basename='inventory-summary')
router.register(r'admin/materials', MaterialAdminViewSet, basename='admin-materials')
router.register(r'admin/inventory', InventoryAdminViewSet, basename='admin-inventory')

urlpatterns = [
    path("materials/", MaterialListView.as_view(), name="materials"),
    path("inventory-by-department/", InventoryByDepartmentView.as_view()),
    path("admin/materials/all/", all_materials_view, name="admin-materials-all"),
    path("inventory-summary-full/", InventorySummaryNoPageView.as_view(), name="inventory-summary-full"),
] + router.urls  # ✅ include router-registered URLs
