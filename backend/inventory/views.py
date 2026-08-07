from rest_framework import viewsets
from accounts.permissions import IsAdminOrCashier
from .models import StockLog
from .serializers import StockLogSerializer


class StockLogViewSet(viewsets.ModelViewSet):
    queryset = StockLog.objects.select_related("product").all()
    serializer_class = StockLogSerializer
    permission_classes = [IsAdminOrCashier]
