// controllers/prospectiveLeadController.js
const ProspectiveLead = require('../models/ProspectiveLead');
const Lead = require('../models/Lead');
// Get all prospective leads
const getAllProspectiveLeads = async (req, res) => {
  try {
    const leads = await ProspectiveLead.find();
    res.status(200).json(leads);
  } catch (err) {
    console.error('Error fetching prospective leads:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add a prospective lead
const addProspectiveLead = async (req, res) => {
  try {
    const { phone, name, city } = req.body;
    
    // Check if the lead already exists
    const existingLead = await ProspectiveLead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this phone number already exists' });
    }

    // Create new lead
    const newLead = new ProspectiveLead({ phone, name, city });
    await newLead.save();

    return res.status(201).json({ message: 'Prospective lead added successfully', lead: newLead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prospectiveLead = await ProspectiveLead.findById(id);
    if (!prospectiveLead) {
      return res.status(404).json({ message: 'Prospective lead not found' });
    }

    prospectiveLead.status = status;
    await prospectiveLead.save();

    // Also update the most recent Lead with the same phone number, if it exists
    const matchedLead = await Lead.findOne({ phone: prospectiveLead.phone }).sort({ createdAt: -1 });
    if (matchedLead && matchedLead.status !== status) {
      matchedLead.status = status;
      await matchedLead.save();
    }

    res.status(200).json({ message: `Prospective lead marked as ${status}`, lead: prospectiveLead });
  } catch (err) {
    console.error('Error updating prospective lead status:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getAllProspectiveLeads, addProspectiveLead, updateLeadStatus };