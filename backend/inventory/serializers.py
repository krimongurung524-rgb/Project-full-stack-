from rest_framework import serializers
from .models import StockLog


class StockLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockLog
        fields = ["id", "product", "product_name", "change_type", "quantity_change", "note", "created_at"]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        log = StockLog.objects.create(**validated_data)
        product = log.product
        product.stock = max(0, product.stock + log.quantity_change)
        product.save(update_fields=["stock"])
        return log
