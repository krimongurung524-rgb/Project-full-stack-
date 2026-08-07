from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["order", "payment_method", "payment_status", "amount", "payment_date"]
    list_filter = ["payment_method", "payment_status"]
