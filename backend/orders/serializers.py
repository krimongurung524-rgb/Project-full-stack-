from django.db import transaction
from rest_framework import serializers
from products.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "price_at_time", "quantity", "subtotal"]
        read_only_fields = ["product_name", "price_at_time", "subtotal"]


class OrderItemInputSerializer(serializers.Serializer):
    """Used only when creating an order: {product: id, quantity: n}"""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "customer", "customer_name", "items", "total_price",
            "status", "note", "order_date", "updated_at",
        ]
        read_only_fields = ["customer", "total_price", "order_date", "updated_at"]


class OrderCreateSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True, default="")
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        order = Order.objects.create(customer=request.user, note=validated_data.get("note", ""))

        for entry in validated_data["items"]:
            product = entry["product"]
            quantity = entry["quantity"]
            if product.stock < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for '{product.name}'. Available: {product.stock}"
                )
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price_at_time=product.price,
                quantity=quantity,
            )
            product.stock -= quantity
            product.save(update_fields=["stock"])

        order.recalculate_total()
        return order
