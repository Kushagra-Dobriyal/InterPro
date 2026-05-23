const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const WebhookEvent = require('../models/WebhookEvent');
const { broadcast } = require('../services/sse');

// POST /api/webhook/reset-quota
router.post('/reset-quota', async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required for idempotency' });
  }

  try {
    // Check if this event was already processed (idempotency)
    const existing = await WebhookEvent.findOne({ eventId });
    if (existing) {
      return res.json({
        message: 'Event already processed (idempotent)',
        processedAt: existing.processedAt
      });
    }

    // Process the quota reset
    await Provider.updateMany({}, { currentMonthLeads: 0 });

    // Record the event
    await WebhookEvent.create({
      eventId,
      eventType: 'quota_reset',
      result: 'All provider quotas reset to 0'
    });

    // Broadcast SSE
    broadcast('quota_reset', { eventId, message: 'All quotas reset' });

    res.json({ message: 'Quotas reset successfully', eventId });
  } catch (err) {
    // Handle race condition where two identical eventIds arrive simultaneously
    if (err.code === 11000) {
      return res.json({
        message: 'Event already processed (idempotent - concurrent)',
        eventId
      });
    }
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
