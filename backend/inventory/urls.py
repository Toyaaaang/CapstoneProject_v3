from django.urls import path
from .views import MaterialListView, InventoryByDepartmentView

urlpatterns = [
    path("materials/", MaterialListView.as_view(), name="materials"),
    path("inventory-by-department/", InventoryByDepartmentView.as_view()),
]
