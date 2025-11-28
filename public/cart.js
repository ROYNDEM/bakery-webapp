document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // We need the full product list to get names and prices
    // because localStorage only stores the ID and quantity.
    const response = await fetch('http://localhost:3000/api/products');
    const allProducts = await response.json();

    let cartTotal = 0; // Variable to store the total amount

    const displayCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = ''; // Clear previous content
        cartTotal = 0; // Reset total before recalculating

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
                cartTotal += itemTotal;

                // Create and append the HTML for each cart item
                cartItemsContainer.innerHTML += `
                    <div class="cart-item">
                        <p>${product.name} (x${cartItem.quantity})</p>
                        <button class="remove-btn" data-product-id="${product.id}">Remove</button>
                        <p>Ksh ${itemTotal.toFixed(2)}</p>
                    </div>
                `;
            }
        });

        cartTotalContainer.innerHTML = `<h3>Total: Ksh ${cartTotal.toFixed(2)}</h3>`;
    };

    // Use event delegation to handle clicks on "Remove" buttons
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const productId = event.target.getAttribute('data-product-id');
            removeFromCart(productId);
        }
    });

    const removeFromCart = (productId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Filter out the item to be removed
        const updatedCart = cart.filter(item => item.id !== productId);

        if (cart.length === updatedCart.length) {
            // If nothing was removed, it might be a product with quantity > 1.
            // For simplicity, this implementation removes the entire product line.
            // A more complex implementation could decrease the quantity.
            alert("Product not found in cart.");
            return;
        }

        // Save the updated cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Re-render the cart to show the changes
        displayCart();
    };

    checkoutBtn.addEventListener('click', async () => {
        // Get the last used phone number from localStorage, or use a default placeholder.
        const savedPhone = localStorage.getItem('bakeryUserPhone') || '254';
        const phone = prompt("Please enter your phone number in the format 254xxxxxxxx:", savedPhone);

        if (!phone || !/^254(7|1)\d{8}$/.test(phone)) {
            alert("Invalid phone number format. Please use 2547xxxxxxxx.");
            return;
        }

        // Save the valid phone number for next time.
        localStorage.setItem('bakeryUserPhone', phone);

        // The amount should be an integer for the Daraja API
        const amount = Math.round(cartTotal);

        if (amount < 1) {
            alert("Your cart is empty or the total is zero.");
            return;
        }

        alert(`Requesting payment of Ksh ${amount} from ${phone}. Please check your phone to enter your M-Pesa PIN.`);

        try {
            const res = await fetch('http://localhost:3000/api/stkpush', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, phone })
            });

            const data = await res.json();
            console.log('STK Push Response:', data);
            alert(data.CustomerMessage || 'An error occurred.');
        } catch (error) {
            console.error('Checkout Error:', error);
            alert('Failed to initiate payment. Please check the console for details.');
        }
    });

    displayCart();
});
