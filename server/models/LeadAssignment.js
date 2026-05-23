const mongoose = require('mongoose');

const leadAssignmentSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  providerId: { type: Number, required: true },
  serviceId: { type: Number, required: true },
  assignedAt: { type: Date, default: Date.now }
});

// Prevent same provider getting same lead twice
leadAssignmentSchema.index({ leadId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('LeadAssignment', leadAssignmentSchema);
