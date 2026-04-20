const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Lazy-load Razorpay — server still boots if package isn't installed yet
let Razorpay;
try {
    Razorpay = require('razorpay');
} catch {
    console.warn('[payment] razorpay package not found. Run: npm install razorpay inside /server');
}

function getRazorpayInstance() {
    if (!Razorpay) {
        throw new Error('razorpay package is not installed. Run: npm install razorpay inside the server directory.');
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error(`Missing Razorpay env vars. KEY_ID=${process.env.RAZORPAY_KEY_ID} SECRET=${process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING'}`);
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Helper: extract a human-readable message from any error shape
function getErrMsg(err) {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    // Razorpay SDK errors are plain objects: { statusCode, error: { description } }
    if (err.error?.description) return err.error.description;
    if (err.error?.code) return err.error.code;
    if (err.message) return err.message;
    return JSON.stringify(err);
}

// POST /api/payment/create-order
router.post('/create-order', auth, async (req, res) => {
    try {
        const razorpay = getRazorpayInstance();
        const options = {
            amount: 50000, // ₹500 in paise
            currency: 'INR',
            receipt: `rzp_${req.user.id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
        };
        const order = await razorpay.orders.create(options);
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('[payment] create-order failed:', JSON.stringify(err, null, 2));
        res.status(500).json({ msg: getErrMsg(err) });
    }
});

// POST /api/payment/verify
router.post('/verify', auth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ msg: 'Missing payment fields' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ msg: 'Server misconfiguration: missing Razorpay secret' });
    }

    // Verify HMAC-SHA256 signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.error('[payment] Signature mismatch', { expected: expectedSignature, got: razorpay_signature });
        return res.status(400).json({ msg: 'Payment verification failed. Invalid signature.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isPremium: true, premiumSince: new Date() },
            { new: true }
        ).select('-password');
        res.json({ msg: 'Payment verified. Welcome to Premium!', user });
    } catch (err) {
        console.error('[payment] DB update error:', err.message);
        res.status(500).json({ msg: 'Payment verified but failed to upgrade account. Contact support.' });
    }
});

module.exports = router;
