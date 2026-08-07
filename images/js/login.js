const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");
const errorBox = document.getElementById("errorBox");

toggle.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        toggle.classList.remove("fa-eye");
        toggle.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        toggle.classList.remove("fa-eye-slash");
        toggle.classList.add("fa-eye");
    }
});

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    if (email.value === "" || password.value === "") {
        showError("Please fill all fields.");
        return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
        // our backend authenticates by username, so we treat the email field's
        // local-part as a fallback if the user types a username instead of email
        const res = await fetch(API_BASE + "/auth/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email.value.trim(), password: password.value }),
        });

        if (!res.ok) {
            showError("Invalid email/username or password.");
            return;
        }

        const data = await res.json();
        saveTokens(data.access, data.refresh);

        const meRes = await fetch(API_BASE + "/auth/me/", {
            headers: { Authorization: "Bearer " + data.access },
        });
        const me = await meRes.json();
        localStorage.setItem("user", JSON.stringify(me));

        if (["admin", "cashier", "staff"].includes(me.role)) {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "menu.html";
        }
    } catch (err) {
        showError("Could not connect to the server. Is the backend running?");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
    }
});
