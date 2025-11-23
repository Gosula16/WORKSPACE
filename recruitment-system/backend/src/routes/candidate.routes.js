const router = require('express').Router();
const candidateCtrl = require('../controllers/candidate.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const upload = require('../utils/fileStorage');

router.get('/me', auth, requireRole('candidate'), candidateCtrl.getMe);
router.put('/me', auth, requireRole('candidate'), upload.single('resume'), candidateCtrl.updateProfile);
router.post('/jobs/:jobId/apply', auth, requireRole('candidate'), upload.single('resume'), candidateCtrl.applyJob);
router.get('/applications', auth, requireRole('candidate'), candidateCtrl.listApplications);
router.get('/test-results', auth, requireRole('candidate'), candidateCtrl.viewTestResults);
router.get('/letters/:letterId/download', auth, requireRole('candidate'), candidateCtrl.downloadLetter);
router.get('/notifications', auth, requireRole('candidate'), candidateCtrl.getNotifications);

module.exports = router;
