const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const verify = require('../utils/verify');

// Get all leads
router.get('/', verify, async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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

// Approve a lead
router.patch('/:id/approve', verify, async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.status = 'approved';
    await lead.save();

    const token = generateAccessToken({ id: lead._id, isAdmin: false });

    res.status(200).json({ message: 'Lead approved', token });
  } catch (err) {
    console.error('Error approving lead:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Reject a lead
router.patch('/:id/reject', verify, async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.status = 'rejected';
    await lead.save();

    res.status(200).json({ message: 'Lead rejected' });
  } catch (err) {
    console.error('Error rejecting lead:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
