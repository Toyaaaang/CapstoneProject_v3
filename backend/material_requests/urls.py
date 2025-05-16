from django.urls import path
from rest_framework.routers import DefaultRouter

from material_requests.views.material_requests import MaterialRequestViewSet
from material_requests.views.charge import ChargeTicketViewSet
from material_requests.views.rv import RequisitionVoucherViewSet
from material_requests.views.po import PurchaseOrderViewSet

router = DefaultRouter()
router.register(r"material-requests", MaterialRequestViewSet, basename="material-requests")
router.register(r"charge-tickets", ChargeTicketViewSet, basename="charge-ticket")
router.register(r'requisition-vouchers', RequisitionVoucherViewSet, basename='requisition-voucher')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')


urlpatterns = router.urls
