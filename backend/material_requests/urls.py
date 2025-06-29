from django.urls import path
from rest_framework.routers import DefaultRouter

from material_requests.views.material_requests import MaterialRequestViewSet
from material_requests.views.charge import ChargeTicketViewSet
from material_requests.views.rv import RequisitionVoucherViewSet
from material_requests.views.po import PurchaseOrderViewSet
from material_requests.views.qc import QualityCheckViewSet
from material_requests.views.cert import CertificationViewSet
from material_requests.views.rr import ReceivingReportViewSet
from .views.supplier import SupplierListView
from .views.geocode import locationiq_geocode

router = DefaultRouter()
router.register(r"material-requests", MaterialRequestViewSet, basename="material-requests")
router.register(r"charge-tickets", ChargeTicketViewSet, basename="charge-ticket")
router.register(r'requisition-vouchers', RequisitionVoucherViewSet, basename='requisition-voucher')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'quality-checks', QualityCheckViewSet, basename='quality-check')
router.register(r"certifications", CertificationViewSet, basename="certification")
router.register(r"receiving-reports", ReceivingReportViewSet, basename="receiving-report")
router.register(r'employee/requests-history', MaterialRequestViewSet, basename='employee-requests-history')

urlpatterns = [
    # ... other endpoints ...
    path('suppliers/', SupplierListView.as_view(), name='supplier-list'),
    path("geocode/", locationiq_geocode, name="locationiq_geocode"),
] + router.urls
