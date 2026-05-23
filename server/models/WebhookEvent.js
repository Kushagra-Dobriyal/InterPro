const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
  result: { type: String, default: '' }
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
