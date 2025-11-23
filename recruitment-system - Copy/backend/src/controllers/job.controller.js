const Job = require('../models/Job');
const Company = require('../models/Company');

exports.createJob = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyRef);
    const job = await Job.create({
      ...req.body,
      companyId: req.user.companyRef,
      companyName: company.name
    });
    res.status(201).json(job);
  } catch (err) { next(err); }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    // permission: company owning job or admin (simple check)
    if (String(job.companyId) !== String(req.user.companyRef || req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.listJobsForCompany = async (req, res, next) => {
  try {
    const jobs = await Job.find({ companyId: req.user.companyRef || req.user._id });
    res.json(jobs);
  } catch (err) { next(err); }
};
