const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const leadsRouter = require('./routes/leads');
const catalogueRouter = require('./routes/catalogue');
const prospectiveLeadsRouter = require('./routes/prospectiveLeads');

dotenv.config(); // Loads .env variables

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse incoming requests with JSON payloads

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/leads', leadsRouter); // Use the leads routes
app.use('/api/catalogue', catalogueRouter); // Use the catalogue routes

// Test Route
app.get('/api/ping', (req, res) => {
  console.log('Ping request received');
  res.send('pong');
});

app.use('/api/prospective-leads', prospectiveLeadsRouter); // Register new route

// Start the server
app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
});
