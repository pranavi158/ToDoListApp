const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }, // For soft delete
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
