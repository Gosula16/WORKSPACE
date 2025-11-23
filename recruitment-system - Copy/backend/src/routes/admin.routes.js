const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/users', auth, requireRole('admin'), adminCtrl.listUsers);
router.get('/companies', auth, requireRole('admin'), adminCtrl.listCompanies);
router.post('/users/approve', auth, requireRole('admin'), adminCtrl.approveUser);
router.put('/companies/verify', auth, requireRole('admin'), adminCtrl.verifyCompany);
router.put('/companies/deactivate', auth, requireRole('admin'), adminCtrl.deactivateCompany);
router.post('/publish-results', auth, requireRole('admin'), adminCtrl.publishResults);
router.get('/stats', auth, requireRole('admin'), adminCtrl.getStats);
router.get('/logs', auth, requireRole('admin'), adminCtrl.getLogs);

module.exports = router;
