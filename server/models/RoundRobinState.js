const mongoose = require('mongoose');

const roundRobinStateSchema = new mongoose.Schema({
  serviceId: { type: Number, required: true, unique: true },
  poolIndex: { type: Number, default: 0 }
});

module.exports = mongoose.model('RoundRobinState', roundRobinStateSchema);
