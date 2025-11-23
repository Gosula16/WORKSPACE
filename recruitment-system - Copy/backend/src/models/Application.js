const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumeUrl: String,
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['applied', 'shortlisted', 'rejected'], default: 'applied' },
  score: Number,
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
