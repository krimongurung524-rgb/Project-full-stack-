const cartItems = document.getElementById("cartItems");
const total = document.getElementById("total");

let cart = [];
let grandTotal = 0;

const buttons = document.querySelectorAll(".product button");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const product = button.parentElement;

        const name = product.querySelector("h3").textContent;

        const price = parseFloat(
            product.querySelector("p").textContent.replace("$","")
        );

        cart.push({
            name,
            price
        });

        updateCart();

    });

});

function updateCart(){

    cartItems.innerHTML="";

    grandTotal=0;

    if(cart.length===0){

        cartItems.innerHTML="<p>No Items Added</p>";

        total.textContent="$0.00";

        return;

    }

    cart.forEach((item,index)=>{

        grandTotal+=item.price;

        const div=document.createElement("div");

        div.className="cart-item";

        div.innerHTML=`
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
            <button onclick="removeItem(${index})">❌</button>
        `;

        cartItems.appendChild(div);

    });

    total.textContent="$"+grandTotal.toFixed(2);

}

function removeItem(index){

    cart.splice(index,1);

    updateCart();

}

document.getElementById("checkout").addEventListener("click",()=>{

    if(cart.length===0){

        alert("Cart is Empty!");

        return;

    }

    alert("Order Placed Successfully!");

    cart=[];

    updateCart();

});