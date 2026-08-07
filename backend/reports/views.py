from datetime import timedelta
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrCashier
from orders.models import Order, OrderItem
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardSummaryView(APIView):
    """Powers the admin dashboard cards: total sales, orders, customers, products."""
    permission_classes = [IsAuthenticated, IsAdminOrCashier]

    def get(self, request):
        completed = Order.objects.exclude(status=Order.Status.CANCELLED)
        total_sales = completed.aggregate(total=Sum("total_price"))["total"] or 0
        return Response({
            "total_sales": total_sales,
            "total_orders": Order.objects.count(),
            "total_customers": User.objects.filter(role=User.Role.CUSTOMER).count(),
            "total_products": Product.objects.count(),
        })


class SalesReportView(APIView):
    """
    /api/reports/sales/?period=daily|weekly|monthly
    Returns total revenue + order count for the chosen period, plus best-selling coffee.
    """
    permission_classes = [IsAuthenticated, IsAdminOrCashier]

    def get(self, request):
        period = request.query_params.get("period", "daily")
        now = timezone.now()
        if period == "weekly":
            start = now - timedelta(days=7)
        elif period == "monthly":
            start = now - timedelta(days=30)
        else:
            start = now - timedelta(days=1)

        orders = Order.objects.exclude(status=Order.Status.CANCELLED).filter(order_date__gte=start)
        total_sales = orders.aggregate(total=Sum("total_price"))["total"] or 0
        order_count = orders.count()

        best_sellers = (
            OrderItem.objects.filter(order__in=orders)
            .values("product_name")
            .annotate(total_qty=Sum("quantity"))
            .order_by("-total_qty")[:5]
        )

        return Response({
            "period": period,
            "since": start,
            "total_sales": total_sales,
            "order_count": order_count,
            "best_sellers": list(best_sellers),
        })
