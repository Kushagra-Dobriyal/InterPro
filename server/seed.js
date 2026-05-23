require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Provider = require('./models/Provider');
const RoundRobinState = require('./models/RoundRobinState');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Service.deleteMany({});
  await Provider.deleteMany({});
  await RoundRobinState.deleteMany({});

  // Seed services
  await Service.insertMany([
    { serviceId: 1, name: 'Service 1' },
    { serviceId: 2, name: 'Service 2' },
    { serviceId: 3, name: 'Service 3' }
  ]);
  console.log('Services seeded');

  // Seed providers
  const providers = [];
  for (let i = 1; i <= 8; i++) {
    providers.push({
      providerId: i,
      name: `Provider ${i}`,
      monthlyQuota: 10,
      currentMonthLeads: 0
    });
  }
  await Provider.insertMany(providers);
  console.log('Providers seeded');

  // Seed round-robin state
  await RoundRobinState.insertMany([
    { serviceId: 1, poolIndex: 0 },
    { serviceId: 2, poolIndex: 0 },
    { serviceId: 3, poolIndex: 0 }
  ]);
  console.log('Round-robin state seeded');

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
