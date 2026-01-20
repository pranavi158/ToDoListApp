const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/calm_todo';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') { // Prevent listening during tests or serverless import if needed
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
