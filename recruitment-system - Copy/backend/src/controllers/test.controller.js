const Test = require('../models/Test');
const Submission = require('../models/Submission');
const Application = require('../models/Application');

exports.createTest = async (req, res, next) => {
  try {
    const t = await Test.create({ ...req.body, companyId: req.user.companyRef || req.user._id });
    res.status(201).json(t);
  } catch (err) { next(err); }
};

exports.startTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json({ testId: test._id, durationSec: test.durationSec, questions: test.questions.map(q => ({ _id: q._id, qText: q.qText, type: q.type, options: q.options })) , startedAt: Date.now() });
  } catch (err) { next(err); }
};

exports.submitTest = async (req, res, next) => {
  try {
    const { answers } = req.body; // array { qId, answerIndex }
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // auto-evaluate MCQs
    let marks = 0;
    for (const a of answers) {
      const q = test.questions.id(a.qId);
      if (!q) continue;
      if (q.type === 'mcq' && q.correctOptionIndex === a.answer) marks += q.marks || 1;
    }

    const sub = await Submission.create({
      testId: test._id,
      candidateId: req.user._id,
      answers,
      startedAt: req.body.startedAt || new Date(),
      submittedAt: new Date(),
      marksObtained: marks
    });

    // update application score if exists
    const app = await Application.findOne({ jobId: test.jobId, candidateId: req.user._id });
    if (app) { app.score = marks; app.submissionId = sub._id; await app.save(); }

    res.json({ submissionId: sub._id, marks });
  } catch (err) { next(err); }
};

exports.evaluateDescriptive = async (req, res, next) => {
  try {
    const { submissionId, evaluations } = req.body; // evaluations: array { qId, marks }
    const sub = await Submission.findById(submissionId);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    let totalMarks = sub.marksObtained || 0;
    for (const e of evaluations) {
      totalMarks += e.marks;
    }
    sub.marksObtained = totalMarks;
    await sub.save();
    res.json(sub);
  } catch (err) { next(err); }
};

exports.publishTestResults = async (req, res, next) => {
  try {
    const { testId } = req.body;
    await Submission.updateMany({ testId }, { published: true });
    res.json({ message: 'Results published' });
  } catch (err) { next(err); }
};
