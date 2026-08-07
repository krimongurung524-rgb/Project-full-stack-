from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from products.models import Category, Product

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with sample categories, products, and an admin account."

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin", email="admin@smartcafe.com", password="Admin@123", role="admin"
            )
            self.stdout.write(self.style.SUCCESS("Created admin user -> username: admin / password: Admin@123"))

        categories = {
            "Espresso": "Strong and Rich Coffee",
            "Latte": "Creamy Milk Coffee",
            "Cappuccino": "Foamy Coffee",
            "Mocha": "Chocolate Coffee",
            "Tea": "Hot & Refreshing Tea",
        }
        cat_objs = {}
        for name, desc in categories.items():
            cat, _ = Category.objects.get_or_create(name=name)
            cat_objs[name] = cat

        products = [
            ("Espresso Shot", "Espresso", 150, 40, "Single shot of pure espresso."),
            ("Double Espresso", "Espresso", 220, 30, "Double shot, extra strong."),
            ("Classic Latte", "Latte", 250, 35, "Smooth espresso with steamed milk."),
            ("Vanilla Latte", "Latte", 280, 25, "Latte with a hint of vanilla."),
            ("Cappuccino", "Cappuccino", 260, 30, "Espresso topped with thick foam."),
            ("Mocha", "Mocha", 300, 20, "Espresso, chocolate, and steamed milk."),
            ("Masala Tea", "Tea", 100, 50, "Traditional Nepali spiced tea."),
            ("Green Tea", "Tea", 120, 40, "Light and healthy green tea."),
        ]
        for name, cat_name, price, stock, desc in products:
            Product.objects.get_or_create(
                name=name,
                defaults=dict(category=cat_objs[cat_name], price=price, stock=stock, description=desc),
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {Category.objects.count()} categories and {Product.objects.count()} products."))
