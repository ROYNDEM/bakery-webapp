document.addEventListener('DOMContentLoaded', () => {
    const categoriesContainer = document.getElementById('categories-container');
    const searchBar = document.getElementById('search-bar');
    const cartCount = document.getElementById('cart-count');
    let allProducts = []; // To store the master list of products

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    const renderProducts = (productsToRender) => {
        categoriesContainer.innerHTML = ''; // Clear previous content

        // 1. Define categories based on keywords in product names
        const categories = {
            'Cakes': ['Cake', 'Cheesecake'],
            'Cupcakes': ['Cupcakes'],
            'Cookies': ['Cookies'],
            'Pastries': ['Pie', 'Roll']
        };

        const categorizedProducts = {};

        // 2. Group products into categories
        productsToRender.forEach(product => {
            let foundCategory = 'Others';
            for (const categoryName in categories) {
                if (categories[categoryName].some(keyword => product.name.includes(keyword))) {
                    foundCategory = categoryName;
                    break;
                }
            }
            if (!categorizedProducts[foundCategory]) {
                categorizedProducts[foundCategory] = [];
            }
            categorizedProducts[foundCategory].push(product);
        });

        // 3. Render each category and its products
        for (const categoryName in categorizedProducts) {
            const section = document.createElement('section');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = categoryName;
            section.appendChild(title);

            const productListDiv = document.createElement('div');
            productListDiv.className = 'product-list';

            categorizedProducts[categoryName].forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-item';
                productDiv.innerHTML = `
                    <img src="/${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/placeholder.png';">
                    <div style="flex-grow: 1;">
                        <h3>${product.name}</h3>
                        <p>Ksh ${product.price.toFixed(2)}</p>
                    </div>
                    <button data-product-id="${product.id}">Add to Cart</button>
                `;
                productListDiv.appendChild(productDiv);
            });

            section.appendChild(productListDiv);
            categoriesContainer.appendChild(section);
        }

        if (productsToRender.length === 0) {
            categoriesContainer.innerHTML = '<p>No products match your search.</p>';
        }
    };

    const addToCart = (productId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === productId);

        existingProduct ? existingProduct.quantity++ : cart.push({ id: productId, quantity: 1 });

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Item added to cart!');
    };

    // Event Listeners
    categoriesContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            addToCart(event.target.dataset.productId);
        }
    });

    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Initial Load
    const init = async () => {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        renderProducts(allProducts);
        updateCartCount();
    };

    init();
});
