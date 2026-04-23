const express = require('express');
const router = express.Router();
const {
  getAlerts, getMyAlerts, getAlert,
  createAlert, updateStatus, assignAlert, deleteAlert,
} = require('../controllers/alertController');
const { protect, requireRole } = require('../middleware/auth');

const SERVICE_ROLES  = ['admin', 'admin_police', 'admin_hospital', 'admin_fire', 'police', 'hospital', 'fire', 'responder'];
const MUTATE_ROLES   = ['admin', 'admin_police', 'admin_hospital', 'admin_fire', 'police', 'hospital', 'fire', 'responder'];
const ASSIGN_ROLES   = ['admin', 'admin_police', 'admin_hospital', 'admin_fire', 'police', 'hospital', 'fire', 'responder'];

router.use(protect);

router.get('/',    requireRole(...SERVICE_ROLES), getAlerts);
router.get('/my',  getMyAlerts);
router.get('/:id', getAlert);
router.post('/',   requireRole('citizen', 'responder'), createAlert);
router.patch('/:id/status', requireRole(...MUTATE_ROLES), updateStatus);
router.patch('/:id/assign', requireRole(...ASSIGN_ROLES), assignAlert);
router.delete('/:id', requireRole('admin'), deleteAlert);

module.exports = router;
