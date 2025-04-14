// controllers/leadController.js
const Lead = require('../models/Lead');

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Approve a lead
const approveLead = async (req, res) => {
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
};

// Reject a lead
const rejectLead = async (req, res) => {
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
};

module.exports = { getAllLeads, approveLead, rejectLead };
