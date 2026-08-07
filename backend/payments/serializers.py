from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_status = serializers.CharField(source="order.status", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "order", "order_status", "payment_method", "payment_status", "amount", "payment_date"]
        read_only_fields = ["payment_date"]
