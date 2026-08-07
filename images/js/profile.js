requireLogin();

const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");

function showError(msg) {
    successBox.style.display = "none";
    errorBox.textContent = msg;
    errorBox.style.display = "block";
}
function showSuccess(msg) {
    errorBox.style.display = "none";
    successBox.textContent = msg;
    successBox.style.display = "block";
}

async function loadProfile() {
    const res = await apiFetch("/auth/me/");
    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));

    document.getElementById("username").value = user.username;
    document.getElementById("role").value = user.role;
    document.getElementById("first_name").value = user.first_name || "";
    document.getElementById("last_name").value = user.last_name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("address").value = user.address || "";
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await apiFetch("/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
        }),
    });
    if (res.ok) {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        showSuccess("Profile updated successfully.");
    } else {
        showError("Could not update profile.");
    }
});

document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await apiFetch("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({
            old_password: document.getElementById("old_password").value,
            new_password: document.getElementById("new_password").value,
        }),
    });
    const data = await res.json();
    if (res.ok) {
        showSuccess("Password updated successfully.");
        e.target.reset();
    } else {
        showError(data.old_password || data.new_password || "Could not update password.");
    }
});

document.getElementById("logoutBtn").addEventListener("click", logout);

loadProfile();
