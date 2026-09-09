
// ================= PRODUCT DATA =================

const products = [

    {
        id: 1,
        name: "Wireless Headphones",
        category: "electronics",
        price: 1999,
        image: "🎧"
    },

    {
        id: 2,
        name: "Smart Watch",
        category: "electronics",
        price: 2499,
        image: "⌚"
    },

    {
        id: 3,
        name: "Bluetooth Speaker",
        category: "electronics",
        price: 1499,
        image: "🔊"
    },

    {
        id: 4,
        name: "Men's T-Shirt",
        category: "fashion",
        price: 799,
        image: "👕"
    },

    {
        id: 5,
        name: "Women's Dress",
        category: "fashion",
        price: 1499,
        image: "👗"
    },

    {
        id: 6,
        name: "Running Shoes",
        category: "shoes",
        price: 2199,
        image: "👟"
    },

    {
        id: 7,
        name: "Casual Sneakers",
        category: "shoes",
        price: 1799,
        image: "👞"
    },

    {
        id: 8,
        name: "Backpack",
        category: "accessories",
        price: 999,
        image: "🎒"
    },

    {
        id: 9,
        name: "Sunglasses",
        category: "accessories",
        price: 699,
        image: "🕶️"
    },

    {
        id: 10,
        name: "Leather Wallet",
        category: "accessories",
        price: 599,
        image: "👛"
    },

    {
        id: 11,
        name: "Mobile Phone",
        category: "electronics",
        price: 15999,
        image: "📱"
    },

    {
        id: 12,
        name: "Laptop",
        category: "electronics",
        price: 49999,
        image: "💻"
    }

];


// ================= CART =================

let cart = [];


// ================= DISPLAY PRODUCTS =================

function displayProducts(productList) {

    const container =
        document.getElementById("product-container");

    container.innerHTML = "";


    if (productList.length === 0) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;
    }


    productList.forEach(product => {

        const card = document.createElement("div");

        card.classList.add("product-card");


        card.innerHTML = `

            <div class="product-image">
                ${product.image}
            </div>

            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <p class="product-category">
                    ${product.category}
                </p>

                <p class="price">
                    ₹${product.price.toLocaleString("en-IN")}
                </p>

                <button
                    class="add-btn"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>

            </div>
        `;


        container.appendChild(card);

    });
}


// ================= ADD TO CART =================

function addToCart(productId) {

    const product =
        products.find(item => item.id === productId);


    const existingProduct =
        cart.find(item => item.id === productId);


    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCart();


    alert(`${product.name} added to cart!`);
}


// ================= UPDATE CART =================

function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const cartTotal =
        document.getElementById("cart-total");


    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        cartCount.textContent = "0";

        cartTotal.textContent = "0";

        return;
    }


    let total = 0;

    let totalQuantity = 0;


    cart.forEach(item => {

        total += item.price * item.quantity;

        totalQuantity += item.quantity;


        const cartItem =
            document.createElement("div");

        cartItem.classList.add("cart-item");


        cartItem.innerHTML = `

            <div class="cart-item-image">
                ${item.image}
            </div>

            <div class="cart-item-info">

                <h4>
                    ${item.name}
                </h4>

                <p>
                    ₹${item.price.toLocaleString("en-IN")}
                </p>

                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity(${item.id})"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${item.id})"
                    >
                        +
                    </button>

                </div>

            </div>

            <button
                class="remove-btn"
                onclick="removeFromCart(${item.id})"
            >
                🗑️
            </button>

        `;


        cartItems.appendChild(cartItem);

    });


    cartCount.textContent = totalQuantity;

    cartTotal.textContent =
        total.toLocaleString("en-IN");
}


// ================= INCREASE QUANTITY =================

function increaseQuantity(productId) {

    const item =
        cart.find(product => product.id === productId);


    if (item) {

        item.quantity++;

        updateCart();

    }
}


// ================= DECREASE QUANTITY =================

function decreaseQuantity(productId) {

    const item =
        cart.find(product => product.id === productId);


    if (item) {

        if (item.quantity > 1) {

            item.quantity--;

        } else {

            cart =
                cart.filter(
                    product => product.id !== productId
                );

        }

        updateCart();

    }
}


// ================= REMOVE FROM CART =================

function removeFromCart(productId) {

    cart =
        cart.filter(
            product => product.id !== productId
        );

    updateCart();
}


// ================= OPEN CART =================

function openCart() {

    document
        .getElementById("cart-overlay")
        .classList.add("active");

}


// ================= CLOSE CART =================

function closeCart() {

    document
        .getElementById("cart-overlay")
        .classList.remove("active");

}


// ================= SEARCH =================

function searchProducts() {

    const searchValue =
        document
            .getElementById("search")
            .value
            .toLowerCase();


    const filteredProducts =
        products.filter(product =>

            product.name
                .toLowerCase()
                .includes(searchValue)

        );


    displayProducts(filteredProducts);
}


// ================= FILTER =================

function filterProducts(category) {

    if (category === "all") {

        displayProducts(products);

        return;
    }


    const filteredProducts =
        products.filter(product =>
            product.category === category
        );


    displayProducts(filteredProducts);
}


// ================= CHECKOUT =================

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    alert(
        "Thank you for shopping with ShopEase! 🛍️"
    );


    cart = [];

    updateCart();

    closeCart();
}


// ================= INITIAL LOAD =================

displayProducts(products);

updateCart();

