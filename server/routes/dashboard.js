const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const LeadAssignment = require('../models/LeadAssignment');
const Lead = require('../models/Lead');

// GET /api/dashboard — Get all providers with their assigned leads
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find().sort({ providerId: 1 });
    
    const dashboardData = await Promise.all(
      providers.map(async (provider) => {
        const assignments = await LeadAssignment.find({ providerId: provider.providerId })
          .sort({ assignedAt: -1 });
        
        const leadIds = assignments.map(a => a.leadId);
        const leads = await Lead.find({ _id: { $in: leadIds } });
        
        // Map leads by ID for easy lookup
        const leadMap = {};
        leads.forEach(l => { leadMap[l._id.toString()] = l; });

        const assignedLeads = assignments.map(a => {
          const lead = leadMap[a.leadId.toString()];
          return lead ? {
            leadId: lead._id,
            name: lead.name,
            phone: lead.phone,
            city: lead.city,
            serviceId: lead.serviceId,
            description: lead.description,
            assignedAt: a.assignedAt
          } : null;
        }).filter(Boolean);

        return {
          providerId: provider.providerId,
          name: provider.name,
          monthlyQuota: provider.monthlyQuota,
          currentMonthLeads: provider.currentMonthLeads,
          remainingQuota: provider.monthlyQuota - provider.currentMonthLeads,
          assignedLeads
        };
      })
    );

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
