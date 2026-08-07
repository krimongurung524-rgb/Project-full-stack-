const form = document.getElementById("registerForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
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

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
        const res = await fetch(API_BASE + "/auth/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                password: password.value,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            const firstError = Object.values(data)[0];
            showError(Array.isArray(firstError) ? firstError[0] : "Registration failed. Please check your details.");
            return;
        }

        saveTokens(data.tokens.access, data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "menu.html";
    } catch (err) {
        showError("Could not connect to the server. Is the backend running?");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
    }
});
