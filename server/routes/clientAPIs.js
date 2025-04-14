// routes/prospectiveLeads.js
const express = require('express');
const Lead = require('../models/Lead');
const router = express.Router();
const verify = require('../utils/verify');


// Submit form (new lead)
router.post('/form/submit', verify, async (req, res) => {
  const { name, phone, city, business, role } = req.body;
  if (!name || !phone || !city || !business || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newLead = new Lead({ name, phone, city, business, role });
    await newLead.save();
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    console.error('Error saving form data:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
