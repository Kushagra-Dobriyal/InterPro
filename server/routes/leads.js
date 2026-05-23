const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { allocateLead } = require('../services/allocation');
const { broadcast } = require('../services/sse');

// POST /api/leads — Create a new lead
router.post('/', async (req, res) => {
  const { name, phone, city, serviceId, description } = req.body;

  // Basic validation
  if (!name || !phone || !city || !serviceId) {
    return res.status(400).json({ error: 'Name, phone, city, and serviceId are required' });
  }

  if (![1, 2, 3].includes(Number(serviceId))) {
    return res.status(400).json({ error: 'Invalid service. Must be 1, 2, or 3' });
  }

  const session = await mongoose.startSession();

  try {
    let lead;
    let assignedProviderIds;

    await session.withTransaction(async () => {
      // Create the lead (unique index on phone+serviceId will catch duplicates)
      const leads = await Lead.create(
        [{
          name,
          phone: String(phone),
          city,
          serviceId: Number(serviceId),
          description: description || '',
          assignedProviders: []
        }],
        { session }
      );
      lead = leads[0];

      // Allocate to providers
      assignedProviderIds = await allocateLead(lead, session);

      // Update lead with assigned providers
      await Lead.findByIdAndUpdate(
        lead._id,
        { assignedProviders: assignedProviderIds },
        { session }
      );
    });

    // Broadcast SSE event (outside transaction)
    broadcast('lead_assigned', {
      leadId: lead._id,
      serviceId: Number(serviceId),
      assignedProviders: assignedProviderIds
    });

    res.status(201).json({
      message: 'Lead created and assigned successfully',
      lead: {
        id: lead._id,
        name,
        phone,
        city,
        serviceId: Number(serviceId),
        assignedProviders: assignedProviderIds
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'A lead with this phone number already exists for this service'
      });
    }
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  } finally {
    session.endSession();
  }
});

// GET /api/leads — List all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

module.exports = router;
