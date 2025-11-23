const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  qId: mongoose.Schema.Types.ObjectId,
  answer: mongoose.Schema.Types.Mixed
});

const SubmissionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [AnswerSchema],
  startedAt: Date,
  submittedAt: Date,
  marksObtained: Number,
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
