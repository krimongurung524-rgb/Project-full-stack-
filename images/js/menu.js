const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");

let allProducts = [];
let activeCategory = "";
let searchTimer = null;

async function loadCategories() {
    try {
        const res = await fetch(API_BASE + "/products/categories/");
        const data = await res.json();
        const categories = data.results || data;
        categories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.textContent = cat.name;
            btn.dataset.category = cat.id;
            btn.addEventListener("click", () => setActiveCategory(cat.id, btn));
            categoryFilters.appendChild(btn);
        });
    } catch (err) {
        console.error("Could not load categories", err);
    }

    categoryFilters.querySelector("[data-category='']").addEventListener("click", (e) => {
        setActiveCategory("", e.target);
    });
}

function setActiveCategory(categoryId, btnEl) {
    activeCategory = categoryId;
    categoryFilters.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btnEl.classList.add("active");
    loadProducts();
}

async function loadProducts() {
    productGrid.innerHTML = "<p class='loading-text'>Loading menu...</p>";
    try {
        let url = API_BASE + "/products/?available=true";
        if (activeCategory) url += "&category=" + activeCategory;
        if (searchInput.value.trim()) url += "&search=" + encodeURIComponent(searchInput.value.trim());

        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        allProducts = data.results || data;
        renderProducts(allProducts);
    } catch (err) {
        productGrid.innerHTML = "<p class='loading-text'>Could not load the menu. Is the backend server running?</p>";
    }
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = "<p class='loading-text'>No coffee found.</p>";
        return;
    }

    productGrid.innerHTML = "";
    products.forEach((product) => {
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <div class="menu-card-img">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<i class="fa-solid fa-mug-saucer"></i>`}
            </div>
            <h3>${product.name}</h3>
            <p class="desc">${product.description || ""}</p>
            <div class="menu-card-footer">
                <span class="price">Rs. ${parseFloat(product.price).toFixed(2)}</span>
                <button class="add-btn" ${product.stock <= 0 ? "disabled" : ""}>
                    ${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
            </div>
        `;
        const addBtn = card.querySelector(".add-btn");
        if (product.stock > 0) {
            addBtn.addEventListener("click", () => {
                addToCart(product, 1);
                addBtn.textContent = "Added ✓";
                setTimeout(() => (addBtn.textContent = "Add to Cart"), 900);
            });
        }
        productGrid.appendChild(card);
    });
}

searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 400);
});

loadCategories();
loadProducts();
