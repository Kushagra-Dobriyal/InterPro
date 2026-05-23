require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { addClient } = require('./services/sse');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SSE endpoint
app.get('/api/events', (req, res) => {
  addClient(res);
});

// Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/test', require('./routes/test-tools'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
