from django.db import models
from products.models import Product


class StockLog(models.Model):
    """Tracks stock changes (restock or deduction) for auditing / inventory management."""

    class ChangeType(models.TextChoices):
        RESTOCK = "restock", "Restock"
        SALE = "sale", "Sale"
        ADJUSTMENT = "adjustment", "Adjustment"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_logs")
    change_type = models.CharField(max_length=20, choices=ChangeType.choices)
    quantity_change = models.IntegerField(help_text="Positive for restock, negative for sale/deduction")
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name}: {self.quantity_change} ({self.change_type})"
