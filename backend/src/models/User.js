const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone:     { type: String, unique: true, sparse: true, trim: true },
    password:  { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['citizen', 'responder', 'admin', 'admin_police', 'admin_hospital', 'admin_fire', 'police', 'hospital', 'fire'],
      default: 'citizen',
    },
    // For responders / service agents
    service:      { type: String, enum: ['police', 'hospital', 'fire', 'admin'], default: null },
    // Facility this user belongs to (for service admins and their agents)
    facility:     { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', default: null },
    facilityName: { type: String, default: null },
    isActive:     { type: Boolean, default: true },
    avatar:    { type: String, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
