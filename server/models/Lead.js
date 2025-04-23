const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  business: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'pending' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
