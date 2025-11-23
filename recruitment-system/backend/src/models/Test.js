const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  qText: String,
  type: { type: String, default: 'mcq' },
  options: [String],
  correctOptionIndex: Number,
  marks: { type: Number, default: 1 }
});

const TestSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  title: String,
  durationSec: Number,
  questions: [QuestionSchema],
  totalMarks: Number
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);
