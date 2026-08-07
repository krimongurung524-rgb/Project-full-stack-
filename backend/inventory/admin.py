from django.contrib import admin
from .models import StockLog

@admin.register(StockLog)
class StockLogAdmin(admin.ModelAdmin):
    list_display = ["product", "change_type", "quantity_change", "created_at"]
    list_filter = ["change_type"]
