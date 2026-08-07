from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from accounts.permissions import IsAdminOrCashier
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrCashier]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class ProductViewSet(viewsets.ModelViewSet):
    """
    Supports:
      /api/products/?search=latte        -> search by name
      /api/products/?category=2          -> filter by category id
      /api/products/?available=true      -> only in-stock/available items (for the customer menu)
    """
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrCashier]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "is_available"]
    search_fields = ["name", "description"]

    def get_queryset(self):
        qs = super().get_queryset()
        available = self.request.query_params.get("available")
        if available == "true":
            qs = qs.filter(is_available=True, stock__gt=0)
        return qs
