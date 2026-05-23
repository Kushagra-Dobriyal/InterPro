const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  serviceId: { type: Number, required: true },
  description: { type: String, default: '' },
  assignedProviders: [Number],
  createdAt: { type: Date, default: Date.now }
});

// Unique compound index: same phone + same service = duplicate
leadSchema.index({ phone: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
