const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const ProspectiveLead = require('../models/ProspectiveLead');
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

router.get('/prospective', verify, async (req, res) => {
  try {
    const leads = await ProspectiveLead.find();
    res.status(200).json(leads);
  } catch (err) {
    console.error('Error fetching prospective leads:', err);
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
