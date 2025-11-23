const router = require('express').Router();
const testCtrl = require('../controllers/test.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.post('/', auth, requireRole('company'), testCtrl.createTest);
router.get('/:id/start', auth, requireRole('candidate'), testCtrl.startTest);
router.post('/:id/submit', auth, requireRole('candidate'), testCtrl.submitTest);
router.post('/evaluate', auth, requireRole('company'), testCtrl.evaluateDescriptive);
router.post('/publish', auth, requireRole('company'), testCtrl.publishTestResults);

module.exports = router;
