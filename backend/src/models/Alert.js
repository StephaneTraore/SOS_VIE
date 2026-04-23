const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city:    { type: String, default: 'Conakry' },
    lat:     { type: Number, default: null },
    lng:     { type: Number, default: null },
  },
  { _id: false }
);

const alertSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['medical', 'fire', 'accident', 'violence', 'flood', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'],
      default: 'pending',
    },
    service: {
      type: String,
      enum: ['police', 'hospital', 'fire', 'admin'],
      required: true,
    },
    location: { type: locationSchema, required: true },

    // Citizen who created the alert
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Responder assigned to this alert
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Facility this alert is routed to
    facility:     { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', default: null },
    facilityName: { type: String, default: null },

    notes: { type: String, default: null },

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-assign service from type before saving
alertSchema.pre('save', function () {
  const typeToService = {
    medical:  'hospital',
    fire:     'fire',
    flood:    'fire',
    accident: 'police',
    violence: 'police',
    other:    'admin',
  };
  if (!this.service) this.service = typeToService[this.type];
});

module.exports = mongoose.model('Alert', alertSchema);
