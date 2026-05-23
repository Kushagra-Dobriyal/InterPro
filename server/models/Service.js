const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: { type: Number, required: true, unique: true },
  name: { type: String, required: true }
});

module.exports = mongoose.model('Service', serviceSchema);
