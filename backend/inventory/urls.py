from rest_framework.routers import DefaultRouter
from .views import StockLogViewSet

router = DefaultRouter()
router.register("", StockLogViewSet, basename="stocklog")

urlpatterns = router.urls
