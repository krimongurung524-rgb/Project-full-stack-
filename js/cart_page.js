const cartItemsList = document.getElementById("cartItemsList");
const summaryCount = document.getElementById("summaryCount");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const errorBox = document.getElementById("errorBox");

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
}

function renderCart() {
    const cart = getCart();

    if (!cart.length) {
        cartItemsList.innerHTML = "<p class='loading-text'>Your cart is empty. <a href='menu.html'>Browse the menu</a>.</p>";
    } else {
        cartItemsList.innerHTML = "";
        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "cart-row";
            row.innerHTML = `
                <span class="cart-row-name">${item.name}</span>
                <span class="cart-row-price">Rs. ${item.price.toFixed(2)}</span>
                <div class="qty-control">
                    <button class="minus">-</button>
                    <span>${item.quantity}</span>
                    <button class="plus">+</button>
                </div>
                <span class="cart-row-subtotal">Rs. ${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn"><i class="fa-solid fa-trash"></i></button>
            `;
            row.querySelector(".minus").addEventListener("click", () => {
                updateCartQuantity(item.id, item.quantity - 1);
                renderCart();
            });
            row.querySelector(".plus").addEventListener("click", () => {
                updateCartQuantity(item.id, item.quantity + 1);
                renderCart();
            });
            row.querySelector(".remove-btn").addEventListener("click", () => {
                removeFromCart(item.id);
                renderCart();
            });
            cartItemsList.appendChild(row);
        });
    }

    summaryCount.textContent = cartCount();
    summaryTotal.textContent = "Rs. " + cartTotal().toFixed(2);
}

checkoutBtn.addEventListener("click", async () => {
    errorBox.style.display = "none";
    const cart = getCart();

    if (!cart.length) {
        showError("Your cart is empty.");
        return;
    }

    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Placing order...";

    try {
        const res = await apiFetch("/orders/", {
            method: "POST",
            body: JSON.stringify({
                items: cart.map((item) => ({ product: item.id, quantity: item.quantity })),
                note: document.getElementById("orderNote").value.trim(),
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.detail || JSON.stringify(data));
            return;
        }

        clearCart();
        window.location.href = "orders.html?placed=1";
    } catch (err) {
        showError("Could not connect to the server. Is the backend running?");
    } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Place Order";
    }
});

renderCart();
