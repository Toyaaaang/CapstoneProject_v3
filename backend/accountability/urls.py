from rest_framework.routers import DefaultRouter
from .views import AccountabilityViewSet

router = DefaultRouter()
router.register(r"", AccountabilityViewSet, basename="accountability")

urlpatterns = router.urls
