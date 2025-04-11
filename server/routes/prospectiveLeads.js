// routes/prospectiveLeads.js
const express = require('express');
const ProspectiveLead = require('../models/ProspectiveLead');
const router = express.Router();

// API to add a prospective lead
router.post('/add', async (req, res) => {
  try {
    const { phone, name } = req.body;
    
    // Check if the lead already exists
    const existingLead = await ProspectiveLead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this phone number already exists' });
    }

    // Create new lead
    const newLead = new ProspectiveLead({ phone, name });
    await newLead.save();

    return res.status(201).json({ message: 'Prospective lead added successfully', lead: newLead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
