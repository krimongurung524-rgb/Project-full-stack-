requireStaff();

const sectionTitles = {
    overview: "Dashboard", products: "Products", orders: "Orders",
    customers: "Customers", reports: "Reports",
};

document.getElementById("adminName").textContent = (getCurrentUser() && getCurrentUser().username) || "Admin";
document.getElementById("logoutLi").addEventListener("click", logout);

document.querySelectorAll(".sidebar li[data-section]").forEach((li) => {
    li.addEventListener("click", () => {
        document.querySelectorAll(".sidebar li[data-section]").forEach((l) => l.classList.remove("active"));
        li.classList.add("active");
        const section = li.dataset.section;
        document.querySelectorAll(".panel").forEach((p) => (p.style.display = "none"));
        document.getElementById("panel-" + section).style.display = "block";
        document.getElementById("pageTitle").textContent = sectionTitles[section];

        if (section === "overview") loadOverview();
        if (section === "products") loadProducts();
        if (section === "orders") loadOrders();
        if (section === "customers") loadCustomers();
        if (section === "reports") loadReport();
    });
});

/* ---------------- OVERVIEW ---------------- */
async function loadOverview() {
    const res = await apiFetch("/reports/dashboard/");
    const data = await res.json();
    document.getElementById("statSales").textContent = "Rs. " + parseFloat(data.total_sales).toFixed(2);
    document.getElementById("statOrders").textContent = data.total_orders;
    document.getElementById("statCustomers").textContent = data.total_customers;
    document.getElementById("statProducts").textContent = data.total_products;

    const ordersRes = await apiFetch("/orders/");
    const ordersData = await ordersRes.json();
    const orders = (ordersData.results || ordersData).slice(0, 8);
    const tbody = document.querySelector("#recentOrdersTable tbody");
    tbody.innerHTML = orders.length
        ? orders.map((o) => `
            <tr>
                <td>#${o.id}</td><td>${o.customer_name}</td>
                <td>Rs. ${parseFloat(o.total_price).toFixed(2)}</td>
                <td><span class="status-pill status-${o.status}">${o.status}</span></td>
                <td>${new Date(o.order_date).toLocaleDateString()}</td>
            </tr>`).join("")
        : `<tr><td colspan="5">No orders yet.</td></tr>`;
}

/* ---------------- PRODUCTS ---------------- */
let categoriesCache = [];

async function loadCategoriesForForm() {
    const res = await apiFetch("/products/categories/");
    const data = await res.json();
    categoriesCache = data.results || data;
    const select = document.getElementById("productCategory");
    select.innerHTML = categoriesCache.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

async function loadProducts() {
    const search = document.getElementById("productSearch").value.trim();
    const res = await apiFetch("/products/" + (search ? "?search=" + encodeURIComponent(search) : ""));
    const data = await res.json();
    const products = data.results || data;
    const tbody = document.querySelector("#productsTable tbody");
    tbody.innerHTML = products.length
        ? products.map((p) => `
            <tr>
                <td>${p.name}</td><td>${p.category_name || "-"}</td>
                <td>Rs. ${parseFloat(p.price).toFixed(2)}</td><td>${p.stock}</td>
                <td>${p.is_available ? "Available" : "Hidden"}</td>
                <td>
                    <button class="icon-btn edit-product" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn danger delete-product" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join("")
        : `<tr><td colspan="6">No products found.</td></tr>`;

    document.querySelectorAll(".edit-product").forEach((btn) =>
        btn.addEventListener("click", () => openProductForm(products.find((p) => p.id == btn.dataset.id))));
    document.querySelectorAll(".delete-product").forEach((btn) =>
        btn.addEventListener("click", async () => {
            if (!confirm("Delete this product?")) return;
            await apiFetch(`/products/${btn.dataset.id}/`, { method: "DELETE" });
            loadProducts();
        }));
}

function openProductForm(product) {
    const form = document.getElementById("productForm");
    form.style.display = "flex";
    document.getElementById("productId").value = product ? product.id : "";
    document.getElementById("productName").value = product ? product.name : "";
    document.getElementById("productCategory").value = product ? product.category : (categoriesCache[0] && categoriesCache[0].id);
    document.getElementById("productPrice").value = product ? product.price : "";
    document.getElementById("productStock").value = product ? product.stock : "";
    document.getElementById("productAvailable").checked = product ? product.is_available : true;
}

document.getElementById("addProductBtn").addEventListener("click", () => openProductForm(null));
document.getElementById("cancelProductForm").addEventListener("click", () => {
    document.getElementById("productForm").style.display = "none";
});
document.getElementById("productSearch").addEventListener("input", () => {
    clearTimeout(window._pSearchTimer);
    window._pSearchTimer = setTimeout(loadProducts, 350);
});

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("productId").value;
    const payload = {
        name: document.getElementById("productName").value,
        category: document.getElementById("productCategory").value,
        price: document.getElementById("productPrice").value,
        stock: document.getElementById("productStock").value,
        is_available: document.getElementById("productAvailable").checked,
    };
    const url = id ? `/products/${id}/` : "/products/";
    const method = id ? "PATCH" : "POST";
    const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
    if (res.ok) {
        document.getElementById("productForm").style.display = "none";
        loadProducts();
    } else {
        alert("Could not save product. Please check the fields.");
    }
});

/* ---------------- ORDERS ---------------- */
async function loadOrders() {
    const status = document.getElementById("orderStatusFilter").value;
    const res = await apiFetch("/orders/" + (status ? "?status=" + status : ""));
    const data = await res.json();
    const orders = data.results || data;
    const tbody = document.querySelector("#ordersTable tbody");
    const statusOptions = ["pending", "preparing", "ready", "completed", "cancelled"];

    tbody.innerHTML = orders.length
        ? orders.map((o) => `
            <tr>
                <td>#${o.id}</td><td>${o.customer_name}</td>
                <td>${o.items.map((i) => `${i.quantity}× ${i.product_name}`).join(", ")}</td>
                <td>Rs. ${parseFloat(o.total_price).toFixed(2)}</td>
                <td>
                    <select class="status-select" data-id="${o.id}">
                        ${statusOptions.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
                    </select>
                </td>
                <td>${new Date(o.order_date).toLocaleString()}</td>
            </tr>`).join("")
        : `<tr><td colspan="6">No orders found.</td></tr>`;

    document.querySelectorAll(".status-select").forEach((sel) =>
        sel.addEventListener("change", async () => {
            await apiFetch(`/orders/${sel.dataset.id}/status/`, {
                method: "PATCH",
                body: JSON.stringify({ status: sel.value }),
            });
        }));
}
document.getElementById("orderStatusFilter").addEventListener("change", loadOrders);

/* ---------------- CUSTOMERS ---------------- */
async function loadCustomers() {
    const search = document.getElementById("customerSearch").value.trim();
    const res = await apiFetch("/auth/customers/" + (search ? "?search=" + encodeURIComponent(search) : ""));
    const data = await res.json();
    const customers = data.results || data;
    const tbody = document.querySelector("#customersTable tbody");
    tbody.innerHTML = customers.length
        ? customers.map((c) => `
            <tr>
                <td>${c.username}</td><td>${c.email || "-"}</td><td>${c.phone || "-"}</td>
                <td>${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>`).join("")
        : `<tr><td colspan="4">No customers found.</td></tr>`;
}
document.getElementById("customerSearch").addEventListener("input", () => {
    clearTimeout(window._cSearchTimer);
    window._cSearchTimer = setTimeout(loadCustomers, 350);
});

/* ---------------- REPORTS ---------------- */
async function loadReport() {
    const period = document.getElementById("reportPeriod").value;
    const res = await apiFetch("/reports/sales/?period=" + period);
    const data = await res.json();
    document.getElementById("reportRevenue").textContent = "Rs. " + parseFloat(data.total_sales).toFixed(2);
    document.getElementById("reportOrderCount").textContent = data.order_count;
    const tbody = document.querySelector("#bestSellersTable tbody");
    tbody.innerHTML = data.best_sellers.length
        ? data.best_sellers.map((b) => `<tr><td>${b.product_name}</td><td>${b.total_qty}</td></tr>`).join("")
        : `<tr><td colspan="2">No sales in this period.</td></tr>`;
}
document.getElementById("reportPeriod").addEventListener("change", loadReport);

/* ---------------- INIT ---------------- */
loadCategoriesForForm();
loadOverview();
