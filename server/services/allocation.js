const Provider = require('../models/Provider');
const LeadAssignment = require('../models/LeadAssignment');
const RoundRobinState = require('../models/RoundRobinState');

// Mandatory providers per service
const MANDATORY = {
  1: [1],       // Service 1 → Provider 1
  2: [5],       // Service 2 → Provider 5
  3: [1, 4]     // Service 3 → Provider 1 AND Provider 4
};

// Fair pool per service (providers eligible for round-robin)
const FAIR_POOL = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8]
};

const TARGET_ASSIGNMENTS = 3; // Each lead gets exactly 3 providers

async function allocateLead(lead, session) {
  const serviceId = lead.serviceId;
  const mandatoryIds = MANDATORY[serviceId] || [];
  const fairPool = [...(FAIR_POOL[serviceId] || [])];
  
  const assignedProviderIds = [];

  // Step 1: Try to assign mandatory providers
  for (const providerId of mandatoryIds) {
    if (assignedProviderIds.length >= TARGET_ASSIGNMENTS) break;

    // Atomically try to increment quota (only if under limit)
    const updated = await Provider.findOneAndUpdate(
      {
        providerId: providerId,
        currentMonthLeads: { $lt: 10 } // monthlyQuota is always 10
      },
      { $inc: { currentMonthLeads: 1 } },
      { new: true, session }
    );

    if (updated) {
      assignedProviderIds.push(providerId);
    }
    // If mandatory provider has no quota, they are skipped
  }

  // Step 2: Fill remaining slots via round-robin from fair pool
  const remaining = TARGET_ASSIGNMENTS - assignedProviderIds.length;

  if (remaining > 0) {
    // Get round-robin state for this service
    const rrState = await RoundRobinState.findOne({ serviceId }).session(session);
    let poolIndex = rrState ? rrState.poolIndex : 0;
    let assigned = 0;
    let attempts = 0;
    const maxAttempts = fairPool.length * 2; // prevent infinite loop

    while (assigned < remaining && attempts < maxAttempts) {
      const candidateId = fairPool[poolIndex % fairPool.length];
      poolIndex++;
      attempts++;

      // Skip if already assigned (could be a mandatory provider that's also in pool)
      if (assignedProviderIds.includes(candidateId)) continue;

      // Atomically try to increment quota
      const updated = await Provider.findOneAndUpdate(
        {
          providerId: candidateId,
          currentMonthLeads: { $lt: 10 }
        },
        { $inc: { currentMonthLeads: 1 } },
        { new: true, session }
      );

      if (updated) {
        assignedProviderIds.push(candidateId);
        assigned++;
      }
      // If quota full, skip to next
    }

    // Save round-robin pointer
    await RoundRobinState.findOneAndUpdate(
      { serviceId },
      { poolIndex: poolIndex % fairPool.length },
      { upsert: true, session }
    );
  }

  // Step 3: Create assignment records
  for (const providerId of assignedProviderIds) {
    await LeadAssignment.create(
      [{
        leadId: lead._id,
        providerId,
        serviceId,
        assignedAt: new Date()
      }],
      { session }
    );
  }

  return assignedProviderIds;
}

module.exports = { allocateLead };
