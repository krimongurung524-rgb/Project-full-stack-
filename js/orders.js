requireLogin();

const ordersList = document.getElementById("ordersList");
const statusColors = {
    pending: "#f39c12",
    preparing: "#3498db",
    ready: "#9b59b6",
    completed: "#27ae60",
    cancelled: "#e74c3c",
};

if (new URLSearchParams(window.location.search).get("placed") === "1") {
    document.getElementById("placedBanner").style.display = "block";
}

async function loadOrders() {
    try {
        const res = await apiFetch("/orders/");
        const data = await res.json();
        const orders = data.results || data;

        if (!orders.length) {
            ordersList.innerHTML = "<p class='loading-text'>You haven't placed any orders yet. <a href='menu.html'>Browse the menu</a>.</p>";
            return;
        }

        ordersList.innerHTML = "";
        orders.forEach((order) => {
            const card = document.createElement("div");
            card.className = "order-card";
            const itemsHtml = order.items
                .map((i) => `<li>${i.quantity} × ${i.product_name} — Rs. ${parseFloat(i.subtotal).toFixed(2)}</li>`)
                .join("");

            card.innerHTML = `
                <div class="order-card-header">
                    <span>Order #${order.id}</span>
                    <span class="status-badge" style="background:${statusColors[order.status] || "#999"}">${order.status}</span>
                </div>
                <ul class="order-items">${itemsHtml}</ul>
                <div class="order-card-footer">
                    <span>Total: Rs. ${parseFloat(order.total_price).toFixed(2)}</span>
                    <span>${new Date(order.order_date).toLocaleString()}</span>
                </div>
                ${order.status === "pending" ? `<button class="cancel-order-btn" data-id="${order.id}">Cancel Order</button>` : ""}
            `;
            ordersList.appendChild(card);
        });

        document.querySelectorAll(".cancel-order-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                if (!confirm("Cancel this order?")) return;
                await apiFetch(`/orders/${btn.dataset.id}/cancel/`, { method: "PATCH", body: JSON.stringify({}) });
                loadOrders();
            });
        });
    } catch (err) {
        ordersList.innerHTML = "<p class='loading-text'>Could not load your orders.</p>";
    }
}

loadOrders();
