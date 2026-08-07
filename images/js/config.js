// Central API configuration + fetch helper used by every page.
const API_BASE = "http://127.0.0.1:8000/api";

function getTokens() {
    return {
        access: localStorage.getItem("access_token"),
        refresh: localStorage.getItem("refresh_token"),
    };
}

function saveTokens(access, refresh) {
    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
}

function isLoggedIn() {
    return !!getTokens().access;
}

function getCurrentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

function logout() {
    clearTokens();
    window.location.href = "login.html";
}

/**
 * Wrapper around fetch() that:
 *  - prefixes API_BASE
 *  - attaches the JWT access token
 *  - auto-refreshes the token once if it has expired (401) and retries
 */
async function apiFetch(path, options = {}) {
    const { access, refresh } = getTokens();
    const headers = options.headers ? { ...options.headers } : {};
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    if (access) headers["Authorization"] = "Bearer " + access;

    let res = await fetch(API_BASE + path, { ...options, headers });

    if (res.status === 401 && refresh) {
        const refreshRes = await fetch(API_BASE + "/auth/login/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
        if (refreshRes.ok) {
            const data = await refreshRes.json();
            saveTokens(data.access, refresh);
            headers["Authorization"] = "Bearer " + data.access;
            res = await fetch(API_BASE + path, { ...options, headers });
        } else {
            clearTokens();
            window.location.href = "login.html";
        }
    }
    return res;
}

/** Guard a page: redirect to login if not authenticated. Call at top of protected pages. */
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

/** Guard a page for staff-side roles only (admin/cashier/staff). */
function requireStaff() {
    requireLogin();
    const user = getCurrentUser();
    if (user && !["admin", "cashier", "staff"].includes(user.role)) {
        window.location.href = "menu.html";
    }
}
