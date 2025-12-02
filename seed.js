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
const productsToSeed = [ // FULL catalog from Visam Cake House
    // Cakes
    { name: 'Black Forest Cake (1kg)', price: 2200, image: 'images/black-forest.jpg' },
    { name: 'Red Velvet Cake (1kg)', price: 2500, image: 'images/red-velvet.jpg' },
    { name: 'White Forest Cake (1kg)', price: 2200, image: 'images/white-forest.jpg' },
    { name: 'Vanilla Fudge Cake (1kg)', price: 2000, image: 'images/vanilla-fudge.jpg' },
    { name: 'Chocolate Truffle Cake (1kg)', price: 2800, image: 'images/chocolate-truffle.jpg' },
    { name: 'Passion Fruit Cake (1kg)', price: 2400, image: 'images/passion-fruit.jpg' },
    { name: 'Carrot Cake (1kg)', price: 2600, image: 'images/carrot-cake.jpg' },
    { name: 'Blueberry Cheesecake', price: 3000, image: 'images/blueberry-cheesecake.jpg' },
    { name: 'Strawberry Cheesecake', price: 3000, image: 'images/strawberry-cheesecake.jpg' },
    { name: 'Chocolate Fudge Cake (1kg)', price: 2500, image: 'images/chocolate-fudge.jpg' },
    { name: 'Tiramisu Cake (1kg)', price: 3000, image: 'images/tiramisu-cake.jpg' },
    // Cupcakes
    { name: 'Vanilla Cupcakes (6pcs)', price: 900, image: 'images/vanilla-cupcakes.jpg' },
    { name: 'Chocolate Cupcakes (6pcs)', price: 900, image: 'images/chocolate-cupcakes.jpg' },
    { name: 'Red Velvet Cupcakes (6pcs)', price: 1000, image: 'images/red-velvet-cupcakes.jpg' },
    // Cookies
    { name: 'Chocolate Chip Cookies (6pcs)', price: 600, image: 'images/chocolate-chip-cookies.jpg' },
    // Pastries
    { name: 'Meat Pie', price: 250, image: 'images/meat-pie.jpg' },
    { name: 'Chicken Pie', price: 250, image: 'images/chicken-pie.jpg' },
    { name: 'Sausage Roll', price: 200, image: 'images/sausage-roll.jpg' }
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