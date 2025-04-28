const Lead = require('../models/Lead');
const { generateClientToken } = require('../utils/token');
const ProspectiveLead = require('../models/ProspectiveLead');

//submit form (client)
const submitForm = async (req, res) => {
  const { name, phone, city, business, role } = req.body;

  if (!name || !phone || !city || !business || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if a lead already exists for this phone in the main leads collection
    const existingLead = await Lead.findOne({ phone }).sort({ createdAt: -1 });

    if (existingLead) {
      return res.status(409).json({
        message: 'A lead with this phone number already exists.',
        status: existingLead.status,
      });
    }

    // Check if the number exists in prospective leads
    const prospective = await ProspectiveLead.findOne({ phone });

    const newLead = new Lead({
      name,
      phone,
      city,
      business,
      role,
      status: prospective?.status === 'approved' ? 'approved' : 'pending',
    });

    await newLead.save();

    const token = generateClientToken(newLead);

    return res.status(200).json({
      message:
        newLead.status === 'approved'
          ? 'You were already approved! Access granted.'
          : 'Form submitted successfully! Awaiting admin approval.',
      token,
    });
  } catch (err) {
    console.error('Error saving form data:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



// Verify Phone Handler
const verifyPhone = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const lead = await Lead.findOne({ phone });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found. Please fill the form first.' });
    }

    if (lead.status !== 'approved') {
      return res.status(403).json({ message: 'Access not yet approved by admin.' });
    }

    // Use the generateClientToken utility
    const token = generateClientToken(lead);

    return res.status(200).json({ message: 'Access granted', token });
  } catch (error) {
    console.error('Error verifying phone:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Endpoint to fetch lead status by phone number
const getLeadStatus = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const lead = await Lead.findOne({ phone });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    // Return the status of the lead
    return res.status(200).json({
      status: lead.status,
    });
  } catch (error) {
    console.error('Error fetching lead status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//check status value of phone
const checkStatus = async (req, res) => {
  const { phone } = req.params;
  const client = await db.clients.findOne({ phone });

  if (!client) return res.status(404).json({ error: 'Client not found' });

  res.json({ status: client.status }); // e.g., 'approved', 'pending', etc.
};

//refresh token if status do not match
const refreshToken = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const lead = await Lead.findOne({ phone });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    // Use the generateClientToken utility
    const token = generateClientToken(lead);

    return res.status(200).json({ message: 'Token refreshed', token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  submitForm,
  verifyPhone,
  getLeadStatus,
  checkStatus,
  refreshToken,
};
