const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    avatar: { type: String, default: '' }, // URL to avatar
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
