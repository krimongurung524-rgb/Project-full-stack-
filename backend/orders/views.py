from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsOwnerOrStaff
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    Customers: see + create + cancel only their own orders.
    Admin/Cashier/Staff: see all orders and update status.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.select_related("customer").prefetch_related("items")
        if user.role in ("admin", "cashier", "staff"):
            status_param = self.request.query_params.get("status")
            if status_param:
                qs = qs.filter(status=status_param)
            return qs
        return qs.filter(customer=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in (Order.Status.COMPLETED, Order.Status.CANCELLED):
            return Response({"detail": "This order can no longer be cancelled."}, status=400)
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status"])
        # restock cancelled items
        for item in order.items.select_related("product"):
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=["stock"])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        order = self.get_object()
        if request.user.role not in ("admin", "cashier", "staff"):
            return Response({"detail": "Not allowed."}, status=403)
        new_status = request.data.get("status")
        valid_statuses = [c[0] for c in Order.Status.choices]
        if new_status not in valid_statuses:
            return Response({"detail": f"status must be one of {valid_statuses}"}, status=400)
        order.status = new_status
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)
