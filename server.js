// 1. Import necessary packages
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Setup Middleware
// This allows your frontend (running on a different address) to make requests to this backend.
// This is how your index.html, styles.css, and app.js will be accessible to the browser.
app.use(express.static('public'));

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Could not connect to MongoDB', err));

// 5. Define Mongoose Schema and Model
const productSchema = new mongoose.Schema({
    // We don't need to define an 'id' field, MongoDB does it automatically as '_id'
    name: String,
    price: Number,
    image: String
});

const Product = mongoose.model('Product', productSchema);

// 6. Define API routes

// API endpoint for the frontend to get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        // Mongoose uses '_id', but our frontend expects 'id'. Let's transform it.
        const transformedProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            image: p.image
        }));
        res.json(transformedProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// We will add the Daraja API routes here in the next step.

