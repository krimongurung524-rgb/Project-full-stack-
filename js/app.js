const orderBtn = document.getElementById("orderBtn");
const loginBtn = document.getElementById("loginBtn");

orderBtn.addEventListener("click", () => {
    alert("Welcome to Smart Cafe ☕");
});

loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
});