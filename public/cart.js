document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // We need the full product list to get names and prices
    // because localStorage only stores the ID and quantity.
    const response = await fetch('http://localhost:3000/api/products');
    const allProducts = await response.json();

    const displayCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = ''; // Clear previous content
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            checkoutBtn.style.display = 'none'; // Hide checkout button if cart is empty
            cartTotalContainer.innerHTML = ''; // Clear total
            return;
        }

        cart.forEach(cartItem => {
            // Find the full product details using the id
            const product = allProducts.find(p => p.id === cartItem.id);
            if (product) {
                const itemTotal = product.price * cartItem.quantity;
                total += itemTotal;

                // Create and append the HTML for each cart item
                cartItemsContainer.innerHTML += `
                    <div class="cart-item">
                        <p>${product.name} (x${cartItem.quantity})</p>
                        <p>Ksh ${itemTotal.toFixed(2)}</p>
                    </div>
                `;
            }
        });

        cartTotalContainer.innerHTML = `<h3>Total: Ksh ${total.toFixed(2)}</h3>`;
    };

    checkoutBtn.addEventListener('click', () => {
        // We will implement the payment logic here later
        alert('Proceeding to checkout!');
    });

    displayCart();
});
