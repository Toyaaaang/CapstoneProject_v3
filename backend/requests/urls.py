from django.urls import path
from .views import (CreateMaterialRequestView, MyMaterialRequestsView, EvaluateMaterialRequestView,
    ApproveChargeTicketView, MaterialRequestDetailView, MaterialRequestListView)

urlpatterns = [
    path('material-requests/', MaterialRequestListView.as_view(), name='list_material_requests'),
    path('material-requests/create/', CreateMaterialRequestView.as_view(), name='create_material_request'),
    path('my-material-requests/', MyMaterialRequestsView.as_view(), name='my_material_requests'),
    
    path("material-requests/view/<int:pk>/", MaterialRequestDetailView.as_view(), name="material_request_detail"),
    path("material-requests/<int:pk>/evaluate/", EvaluateMaterialRequestView.as_view(), name="evaluate_request"),
    
    path("charge-tickets/<int:pk>/approve/", ApproveChargeTicketView.as_view(), name="approve_charge_ticket"),
]
