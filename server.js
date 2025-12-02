// 1. Import necessary packages
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Setup Middleware
// This allows your frontend (running on a different address) to make requests to this backend.
app.use(cors());

// This allows the server to understand and process JSON data sent in requests.
app.use(express.json());
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

// Define a schema for storing successful orders
const orderSchema = new mongoose.Schema({
    mpesaReceiptNumber: String,
    checkoutRequestID: { type: String, unique: true },
    phoneNumber: String,
    amount: Number,
    status: { type: String, default: 'Completed' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

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

// --- 7. DARAJA API INTEGRATION ---

// Middleware to get Daraja access token
const getDarajaToken = async (req, res, next) => {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        req.darajaToken = response.data.access_token;
        next();
    } catch (error) {
        console.error('Failed to get Daraja token:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to get payment token' });
    }
};

// Endpoint to initiate STK Push
app.post('/api/stkpush', getDarajaToken, async (req, res) => {
    const { amount, phone } = req.body;
    const token = req.darajaToken;

    const shortcode = process.env.DARAJA_SHORTCODE;
    const passkey = process.env.DARAJA_PASSKEY;

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline', // or 'CustomerBuyGoodsOnline' for Till Numbers
        Amount: amount,
        PartyA: phone, // Customer's phone number (e.g., 2547xxxxxxxx)
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: 'https://horrendous-humorously-phillip.ngrok-free.dev/api/callback', // This is your public URL from ngrok
        AccountReference: 'BakeryOrder',
        TransactionDesc: 'Payment for bakery goods'
    };

    try {
        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('STK Push Error:', error.response ? error.response.data.errorMessage : error.message);
        res.status(500).json({ message: 'STK Push failed', error: error.response ? error.response.data : null });
    }
});

// Endpoint for Daraja to send the callback to
app.post('/api/callback', async (req, res) => {
    console.log('--- STK Callback Received ---');
    console.log(JSON.stringify(req.body, null, 2));

    const callbackData = req.body.Body.stkCallback;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
        // Payment was successful
        console.log('Payment successful!');
        const metadata = callbackData.CallbackMetadata.Item;
        const amount = metadata.find(item => item.Name === 'Amount').Value;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
        const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber').Value;

        // Create and save the order
        const newOrder = new Order({
            mpesaReceiptNumber: mpesaReceiptNumber,
            checkoutRequestID: callbackData.CheckoutRequestID,
            phoneNumber: phoneNumber,
            amount: amount
        });

        try {
            await newOrder.save();
            console.log('Order saved successfully to the database.');
        } catch (error) {
            console.error('Error saving order to database:', error);
        }

    } else {
        // Payment failed or was cancelled
        console.log('Payment failed. Reason:', callbackData.ResultDesc);
    }

    // Respond to Safaricom to acknowledge receipt
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Endpoint for the frontend to poll for payment status
app.get('/api/order/status/:checkoutId', async (req, res) => {
    const { checkoutId } = req.params;

    try {
        const order = await Order.findOne({ checkoutRequestID: checkoutId });

        if (order) {
            // Order found, payment is complete
            res.json({ status: 'completed' });
        } else {
            // Order not found yet, payment is pending or failed
            res.json({ status: 'pending' });
        }
    } catch (error) {
        console.error('Error checking order status:', error);
        res.status(500).json({ message: 'Error checking order status' });
    }
});
