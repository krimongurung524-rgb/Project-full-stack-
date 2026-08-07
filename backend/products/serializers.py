from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source="products.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "product_count", "created_at"]
        read_only_fields = ["slug", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "category", "category_name", "description",
            "price", "stock", "image", "is_available", "in_stock",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
