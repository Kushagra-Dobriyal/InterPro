const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { allocateLead } = require('../services/allocation');
const { broadcast } = require('../services/sse');

// POST /api/test/generate-leads — Generate 10 leads concurrently
router.post('/generate-leads', async (req, res) => {
  const services = [1, 2, 3];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
  const results = [];
  const errors = [];

  // Create 10 lead promises that run concurrently
  const promises = Array.from({ length: 10 }, async (_, i) => {
    const serviceId = services[i % 3] || 1;
    const phone = `TEST${Date.now()}${i}`;
    const session = await mongoose.startSession();

    try {
      let lead;
      let assignedProviderIds;

      await session.withTransaction(async () => {
        const leads = await Lead.create(
          [{
            name: `Test User ${i + 1}`,
            phone,
            city: cities[i % cities.length],
            serviceId,
            description: `Auto-generated test lead #${i + 1}`,
            assignedProviders: []
          }],
          { session }
        );
        lead = leads[0];

        assignedProviderIds = await allocateLead(lead, session);

        await Lead.findByIdAndUpdate(
          lead._id,
          { assignedProviders: assignedProviderIds },
          { session }
        );
      });

      broadcast('lead_assigned', {
        leadId: lead._id,
        serviceId,
        assignedProviders: assignedProviderIds
      });

      results.push({
        index: i + 1,
        phone,
        serviceId,
        assignedProviders: assignedProviderIds
      });
    } catch (err) {
      errors.push({ index: i + 1, error: err.message });
    } finally {
      session.endSession();
    }
  });

  await Promise.all(promises);

  res.json({
    message: `Generated ${results.length} leads, ${errors.length} errors`,
    results,
    errors
  });
});

module.exports = router;
