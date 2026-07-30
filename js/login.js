const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const toggle = document.getElementById("togglePassword");

toggle.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";

toggle.classList.remove("fa-eye");

toggle.classList.add("fa-eye-slash");

}

else{

password.type="password";

toggle.classList.remove("fa-eye-slash");

toggle.classList.add("fa-eye");

}

});

form.addEventListener("submit",(e)=>{

e.preventDefault();

if(email.value===""||password.value===""){

alert("Please fill all fields.");

return;

}

alert("Login Successful!");

window.location.href="dashboard.html";

});