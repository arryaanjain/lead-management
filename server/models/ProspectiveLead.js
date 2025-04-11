// models/ProspectiveLead.js
const mongoose = require('mongoose');

const prospectiveLeadSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
});

module.exports = mongoose.model('ProspectiveLead', prospectiveLeadSchema);
