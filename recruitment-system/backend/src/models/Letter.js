const mongoose = require('mongoose');

const LetterSchema = new mongoose.Schema({
  type: { type: String, enum: ['interview', 'offer', 'appointment'], required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  content: { type: String, required: true },
  fileUrl: String,
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'delivered', 'downloaded'], default: 'sent' }
}, { timestamps: true });

module.exports = mongoose.model('Letter', LetterSchema);
