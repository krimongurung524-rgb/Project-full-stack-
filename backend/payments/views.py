from rest_framework import permissions, viewsets
from accounts.permissions import IsOwnerOrStaff
from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related("order", "order__customer")
        if user.role in ("admin", "cashier", "staff"):
            return qs
        return qs.filter(order__customer=user)
