const router = require('express').Router();
const companyCtrl = require('../controllers/company.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const upload = require('../utils/fileStorage');

router.post('/', auth, requireRole('company'), companyCtrl.createCompany);
router.get('/applications', auth, requireRole('company'), companyCtrl.getApplicationsForCompany);
router.put('/profile', auth, requireRole('company'), companyCtrl.updateProfile);
router.put('/applications/:applicationId/status', auth, requireRole('company'), companyCtrl.shortlistCandidate);
router.post('/letters/interview', auth, requireRole('company'), upload.single('letter'), companyCtrl.sendInterviewLetter);
router.post('/letters/offer', auth, requireRole('company'), upload.single('letter'), companyCtrl.sendOfferLetter);
router.post('/letters/appointment', auth, requireRole('company'), upload.single('letter'), companyCtrl.finalizeHiring);

module.exports = router;
