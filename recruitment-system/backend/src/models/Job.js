const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  salaryRange: String,
  status: { type: String, default: 'active' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyName: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
