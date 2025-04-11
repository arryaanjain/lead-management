const express = require('express');
const Lead = require('../models/Lead');
const { generateToken, verifyToken } = require('../utils/auth');

const router = express.Router();

// API route to handle form submission
router.post('/api/form/submit', async (req, res) => {
  const { name, phone, city, business, role } = req.body;

  if (!name || !phone || !city || !business || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newLead = new Lead({ name, phone, city, business, role });
    await newLead.save();
    return res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    console.error('Error saving form data:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API route to fetch all leads
router.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API route to approve a lead
router.patch('/api/leads/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = 'approved';
    await lead.save();

    const token = generateToken({ phone: lead.phone });

    res.status(200).json({
      message: 'Lead approved',
      token, // ✅ send token to frontend
    });
  } catch (err) {
    console.error('Error approving lead:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API route to reject a lead
router.patch('/api/leads/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = 'rejected';
    await lead.save();

    res.status(200).json({ message: 'Lead rejected' });
  } catch (err) {
    console.error('Error rejecting lead:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;


