const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const Letter = require('../models/Letter');

exports.getMe = async (req, res, next) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    if (req.file) updates['profile.resumeUrl'] = `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) { next(err); }
};

exports.applyJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const candidateId = req.user._id;

    const alreadyApplied = await Application.findOne({ jobId, candidateId });
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied to this job' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const resumeUrl = req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : (req.user.profile && req.user.profile.resumeUrl);
    const app = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      resumeUrl,
      companyId: job.companyId
    });
    res.status(201).json(app);
  } catch (err) { next(err); }
};

exports.listApplications = async (req, res, next) => {
  const apps = await Application.find({ candidateId: req.user._id }).populate('jobId');
  res.json(apps);
};

exports.viewTestResults = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ candidateId: req.user._id, published: true }).populate('testId', 'title');
    res.json(submissions);
  } catch (err) { next(err); }
};

exports.downloadLetter = async (req, res, next) => {
  try {
    const letter = await Letter.findById(req.params.letterId);
    if (!letter || letter.candidateId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Letter not found' });
    res.download(letter.fileUrl);
  } catch (err) { next(err); }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) { next(err); }
};
