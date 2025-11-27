// 1. Import necessary packages
const express = require('express');
const cors = require('cors');

// 2. Initialize the Express application
const app = express();
const PORT = 3000;

// 3. Setup Middleware
// This allows your frontend (running on a different address) to make requests to this backend.
app.use(cors());

// This allows the server to understand and process JSON data sent in requests.
app.use(express.json());

// This tells Express to serve all the files in the 'public' folder as static files.
// This is how your index.html, styles.css, and app.js will be accessible to the browser.
app.use(express.static('public'));

// 4. Define API routes
// Sample product data (we will move this to a database later)
const products = [
    { id: 1, name: 'Croissant', price: 150, image: 'images/croissant.jpg' },
    { id: 2, name: 'Sourdough Loaf', price: 450, image: 'images/sourdough.jpg' },
    { id: 3, name: 'Chocolate Chip Cookie', price: 100, image: 'images/cookie.jpg' },
    { id: 4, name: 'Cinnamon Roll', price: 250, image: 'images/cinnamon-roll.jpg' }
];

// API endpoint for the frontend to get all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// 5. Start the server
// This command starts the server and makes it listen for requests on the specified port.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
