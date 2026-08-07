from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrCashier(BasePermission):
    """Allows full write access to admin/cashier, read-only for everyone authenticated."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ("admin", "cashier")


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsOwnerOrStaff(BasePermission):
    """Object-level: customer can only see/edit their own resource; staff-side roles see all."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "cashier", "staff"):
            return True
        owner = getattr(obj, "customer", None) or getattr(obj, "user", None) or obj
        return owner == user
