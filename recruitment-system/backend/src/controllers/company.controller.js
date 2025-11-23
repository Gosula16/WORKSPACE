const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const Letter = require('../models/Letter');
const { sendEmail } = require('../utils/mailer');

exports.createCompany = async (req, res, next) => {
  try {
    const c = await Company.create(req.body);
    res.status(201).json(c);
  } catch (err) { next(err); }
};

exports.getApplicationsForCompany = async (req, res, next) => {
  try {
    // assume req.user.companyRef points to company
    const jobs = await Job.find({ companyId: req.user.companyRef });
    const jobIds = jobs.map(j => j._id);
    const apps = await Application.find({ jobId: { $in: jobIds } }).populate('candidateId').populate('jobId');
    res.json(apps);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.user.companyRef, req.body, { new: true });
    res.json(company);
  } catch (err) { next(err); }
};

exports.shortlistCandidate = async (req, res, next) => {
  try {
    const { applicationId, status } = req.body; // status: 'shortlisted', 'rejected'
    const app = await Application.findByIdAndUpdate(applicationId, { status }, { new: true });
    await Notification.create({
      recipientId: app.candidateId,
      type: status === 'shortlisted' ? 'interview' : 'rejection',
      title: `Application ${status}`,
      message: `Your application for ${app.jobId.title} has been ${status}.`,
      relatedJobId: app.jobId,
      relatedApplicationId: app._id
    });
    res.json(app);
  } catch (err) { next(err); }
};

exports.sendInterviewLetter = async (req, res, next) => {
  try {
    const { candidateId, jobId, content } = req.body;
    const letter = await Letter.create({
      type: 'interview',
      candidateId,
      companyId: req.user.companyRef,
      jobId,
      content,
      fileUrl: req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : null
    });
    await sendEmail(candidateId, 'Interview Invitation', content);
    res.status(201).json(letter);
  } catch (err) { next(err); }
};

exports.sendOfferLetter = async (req, res, next) => {
  try {
    const { candidateId, jobId, content } = req.body;
    const letter = await Letter.create({
      type: 'offer',
      candidateId,
      companyId: req.user.companyRef,
      jobId,
      content,
      fileUrl: req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : null
    });
    await sendEmail(candidateId, 'Job Offer', content);
    res.status(201).json(letter);
  } catch (err) { next(err); }
};

exports.finalizeHiring = async (req, res, next) => {
  try {
    const { candidateId, jobId, content } = req.body;
    const letter = await Letter.create({
      type: 'appointment',
      candidateId,
      companyId: req.user.companyRef,
      jobId,
      content,
      fileUrl: req.file ? `/${process.env.UPLOAD_DIR || 'uploads'}/${req.file.filename}` : null
    });
    await sendEmail(candidateId, 'Appointment Letter', content);
    res.status(201).json(letter);
  } catch (err) { next(err); }
};

exports.getJobsForCompany = async (req, res, next) => {
  try {
    const jobs = await Job.find({ companyId: req.user.companyRef });
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.getTestsForCompany = async (req, res, next) => {
  try {
    const tests = await Test.find({ companyId: req.user.companyRef }).populate('submissions');
    res.json(tests);
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const company = await Company.findById(req.user.companyRef);
    res.json(company);
  } catch (err) { next(err); }
};
