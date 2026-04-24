const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['info', 'warning', 'danger'],
      default: 'info',
    },
    author:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName:    { type: String, default: '' },
    authorRole:    { type: String, default: '' },
    authorService: {
      type: String,
      enum: ['police', 'hospital', 'fire', 'admin', null],
      default: null,
    },
    isActive:  { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

broadcastSchema.index({ createdAt: -1 });
broadcastSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
