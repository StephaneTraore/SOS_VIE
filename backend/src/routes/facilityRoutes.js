const express = require('express');
const router = express.Router();
const { getFacilities, createFacility, updateFacility, deleteFacility } = require('../controllers/facilityController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', getFacilities); // public — no auth needed for map display

router.use(protect);
router.post('/',      requireRole('admin'), createFacility);
router.patch('/:id',  requireRole('admin'), updateFacility);
router.delete('/:id', requireRole('admin'), deleteFacility);

module.exports = router;
