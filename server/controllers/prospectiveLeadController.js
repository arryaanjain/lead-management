// controllers/prospectiveLeadController.js
const ProspectiveLead = require('../models/ProspectiveLead');

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
};


// Update lead status
const updateLeadStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // Extract status from request body
  
      // Check if the status is valid (either 'approved' or 'pending')
      if (!['approved', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const lead = await ProspectiveLead.findById(id);
      if (!lead) return res.status(404).json({ message: 'Prospective lead not found' });
  
      lead.status = status;  // Update status
      await lead.save();
  
      res.status(200).json({ message: `Prospective lead ${status}`, lead });
    } catch (err) {
      console.error('Error updating prospective lead status:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

module.exports = { getAllProspectiveLeads, addProspectiveLead, updateLeadStatus };