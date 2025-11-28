document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartCount = document.getElementById('cart-count');

    // Function to update the cart item count in the header
    const updateCartCount = () => {
        // Get the cart from localStorage, or an empty array if it doesn't exist
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Calculate the total quantity of all items in the cart
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    // Fetch products from our backend API
    fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(products => {
            if (products.length === 0) {
                productList.innerHTML = '<p>No products to display.</p>';
                return;
            }

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-item';
                // Note: The image won't show up yet, that's our next step!
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Ksh ${product.price}</p>
                    <button data-product-id="${product.id}">Add to Cart</button>
                `;
                productList.appendChild(productDiv);
            });
        });

    // Add a single event listener to the product list to handle all button clicks
    productList.addEventListener('click', (event) => {
        // Check if the clicked element is a button
        if (event.target.tagName === 'BUTTON') {
            const productId = event.target.getAttribute('data-product-id');
            addToCart(productId);
        }
    });

    const addToCart = (productId) => {
        // Get the current cart from localStorage or initialize an empty array
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Find if the product is already in the cart
        const existingProduct = cart.find(item => item.id === productId);

        if (existingProduct) {
            // If it exists, just increase the quantity
            existingProduct.quantity++;
        } else {
            // If it's a new product, add it to the cart with quantity 1
            cart.push({ id: productId, quantity: 1 });
        }

        // Save the updated cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Update the count in the header
        alert('Item added to cart!');
    };

    // Update the cart count when the page first loads
    updateCartCount();
});
