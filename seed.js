// This is a special script to add initial data to the database.

require('dotenv').config();
const mongoose = require('mongoose');

// --- 1. Define Product Schema and Model ---
// This should be identical to the one in server.js
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String
});
const Product = mongoose.model('Product', productSchema);

// --- 2. Define the products to be added ---
const productsToSeed = [
    { name: 'Croissant', price: 150, image: 'images/croissant.jpg' },
    { name: 'Sourdough Loaf', price: 450, image: 'images/sourdough.jpg' },
    { name: 'Chocolate Chip Cookie', price: 100, image: 'images/cookie.jpg' },
    { name: 'Cinnamon Roll', price: 250, image: 'images/cinnamon-roll.jpg' }
];

// --- 3. Seeding function ---
const seedDB = async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing products to avoid duplicates
        await Product.deleteMany({});
        console.log('Existing products cleared.');

        // Insert the new products
        await Product.insertMany(productsToSeed);
        console.log('Database has been seeded successfully!');

    } catch (err) {
        console.error('Error seeding the database:', err);
    } finally {
        // Disconnect from the database whether it succeeded or failed
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// --- 4. Run the seeding function ---
seedDB();