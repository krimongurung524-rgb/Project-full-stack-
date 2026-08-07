const orderBtn = document.getElementById("orderBtn");
const loginBtn = document.getElementById("loginBtn");

if (orderBtn) {
    orderBtn.addEventListener("click", () => {
        window.location.href = "menu.html";
    });
}

// Reflect login state on the button: "Login" vs "My Account"
if (loginBtn) {
    if (typeof isLoggedIn === "function" && isLoggedIn()) {
        const user = getCurrentUser();
        loginBtn.textContent = user && ["admin", "cashier", "staff"].includes(user.role) ? "Dashboard" : "My Account";
        loginBtn.addEventListener("click", () => {
            const u = getCurrentUser();
            window.location.href = u && ["admin", "cashier", "staff"].includes(u.role) ? "dashboard.html" : "menu.html";
        });
    } else {
        loginBtn.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
}
