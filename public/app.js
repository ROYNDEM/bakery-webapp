document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');

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
});
