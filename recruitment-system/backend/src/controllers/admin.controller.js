const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Log = require('../models/Log');

exports.listUsers = async (req, res, next) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
};

exports.listCompanies = async (req, res, next) => {
  const c = await Company.find();
  res.json(c);
};

exports.approveUser = async (req, res, next) => {
  try {
    const { userId, action } = req.body; // action: 'approve' or 'remove'
    if (action === 'remove') {
      await User.findByIdAndDelete(userId);
      await Log.create({ action: 'user_removed', userId: req.user._id, details: { removedUserId: userId } });
      res.json({ message: 'User removed' });
    } else {
      // For approval, perhaps set a status or just confirm
      res.json({ message: 'User approved' });
    }
  } catch (err) { next(err); }
};

exports.verifyCompany = async (req, res, next) => {
  try {
    const { companyId, verified } = req.body;
    await Company.findByIdAndUpdate(companyId, { verified });
    await Log.create({ action: 'company_verified', userId: req.user._id, details: { companyId, verified } });
    res.json({ message: `Company ${verified ? 'verified' : 'unverified'}` });
  } catch (err) { next(err); }
};

exports.deactivateCompany = async (req, res, next) => {
  try {
    const { companyId, active } = req.body;
    await Company.findByIdAndUpdate(companyId, { active });
    await Log.create({ action: 'company_deactivated', userId: req.user._id, details: { companyId, active } });
    res.json({ message: `Company ${active ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

exports.publishResults = async (req, res, next) => {
  try {
    const { testId } = req.body;
    await Submission.updateMany({ testId }, { published: true });
    await Log.create({ action: 'results_published', userId: req.user._id, details: { testId } });
    res.json({ message: 'Results published' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    res.json({ totalUsers, totalCompanies, totalJobs, totalApplications });
  } catch (err) { next(err); }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await Log.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) { next(err); }
};
