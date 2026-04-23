const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    type:    { type: String, enum: ['hospital', 'police', 'fire'], required: true },
    address: { type: String, required: true },
    city:    { type: String, default: 'Conakry' },
    phone:   { type: String, default: null },
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
