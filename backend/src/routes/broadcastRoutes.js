const express = require('express');
const router = express.Router();
const {
  listBroadcasts,
  listMyBroadcasts,
  createBroadcast,
  deleteBroadcast,
} = require('../controllers/broadcastController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/',     listBroadcasts);
router.get('/mine', listMyBroadcasts);
router.post('/',    requireRole('admin', 'admin_police', 'admin_hospital', 'admin_fire'), createBroadcast);
router.delete('/:id', deleteBroadcast);

module.exports = router;
