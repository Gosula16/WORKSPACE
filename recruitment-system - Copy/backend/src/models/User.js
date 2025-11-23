const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  phone: String,
  education: [String],
  skills: [String],
  resumeUrl: String,
  bio: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','candidate','company'], required: true },
  profile: ProfileSchema,
  companyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
