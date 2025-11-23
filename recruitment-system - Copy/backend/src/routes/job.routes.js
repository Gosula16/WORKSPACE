const router = require('express').Router();
const jobCtrl = require('../controllers/job.controller');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

router.get('/', jobCtrl.getAllJobs);
router.get('/:id', jobCtrl.getJob);
router.post('/', auth, requireRole('company'), jobCtrl.createJob);
router.put('/:id', auth, jobCtrl.updateJob);
router.delete('/:id', auth, jobCtrl.deleteJob);
router.get('/company/list', auth, requireRole('company'), jobCtrl.listJobsForCompany);

module.exports = router;
