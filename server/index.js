// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Define Lead Schema
const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    business: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: 'pending' }, // Add a status field
  });
  
// Create Lead model
const Lead = mongoose.model('Lead', leadSchema);

// API route to handle form submission
app.post('/api/form/submit', async (req, res) => {
    const { name, phone, city, business, role } = req.body;
  
    // Example validation
    if (!name || !phone || !city || !business || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    // Save lead data to MongoDB
    try {
      const newLead = new Lead({
        name,
        phone,
        city,
        business,
        role
      });
      await newLead.save();
      return res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (err) {
      console.error('Error saving form data:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // server/index.js

// API route to fetch all leads
app.get('/api/leads', async (req, res) => {
    try {
    const leads = await Lead.find(); // Fetch all leads from the database
    res.status(200).json(leads);
    } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ message: 'Internal Server Error' });
    }
});
  

// server/index.js

// API route to approve a lead
app.patch('/api/leads/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id);
  
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
      lead.status = 'approved';  // Add a "status" field in the schema
      await lead.save();
  
      res.status(200).json({ message: 'Lead approved' });
    } catch (err) {
      console.error('Error approving lead:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  // API route to reject a lead
  app.patch('/api/leads/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id);
  
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
      lead.status = 'rejected';  // Add a "status" field in the schema
      await lead.save();
  
      res.status(200).json({ message: 'Lead rejected' });
    } catch (err) {
      console.error('Error rejecting lead:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

//test
app.get('/api/ping', (req, res) => {
    console.log('Ping request received');
    res.send('pong');
});
  

// Start the server
app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
});
