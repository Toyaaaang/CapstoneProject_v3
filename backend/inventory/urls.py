from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MaterialListView, InventoryByDepartmentView, InventorySummaryViewSet

router = DefaultRouter()

urlpatterns = [
    path("materials/", MaterialListView.as_view(), name="materials"),
    path("inventory-by-department/", InventoryByDepartmentView.as_view()),
]

router.register(r'inventory-summary', InventorySummaryViewSet, basename='inventory-summary')
