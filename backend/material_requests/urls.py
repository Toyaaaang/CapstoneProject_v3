from django.urls import path
from rest_framework.routers import DefaultRouter

from material_requests.views.material_requests import MaterialRequestViewSet
from material_requests.views.charge import ChargeTicketViewSet

router = DefaultRouter()
router.register("material-requests", MaterialRequestViewSet, basename="material-requests")
router.register("charge-tickets", ChargeTicketViewSet, basename="charge-ticket")

urlpatterns = router.urls
