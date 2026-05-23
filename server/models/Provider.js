const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  providerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  monthlyQuota: { type: Number, default: 10 },
  currentMonthLeads: { type: Number, default: 0 },
  quotaResetMonth: { type: String, default: '' }
});

module.exports = mongoose.model('Provider', providerSchema);
