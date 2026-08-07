// Shared shopping-cart logic used across menu.html and cart.html.
// The cart itself is just a local "in progress order" — it only touches
// the backend once the user checks out (see cart.js checkout handler).

const CART_KEY = "smart_cafe_cart";

function getCart() {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity,
            stock: product.stock,
        });
    }
    saveCart(cart);
}

function updateCartQuantity(productId, quantity) {
    let cart = getCart();
    if (quantity <= 0) {
        cart = cart.filter((item) => item.id !== productId);
    } else {
        const item = cart.find((i) => i.id === productId);
        if (item) item.quantity = quantity;
    }
    saveCart(cart);
}

function removeFromCart(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

function cartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = cartCount();
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
