const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updateProfile, createUserByAdmin } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

const SERVICE_ADMINS = ['admin', 'admin_police', 'admin_hospital', 'admin_fire'];

router.use(protect);

router.get('/',           requireRole(...SERVICE_ADMINS), getUsers);
router.post('/create',    requireRole(...SERVICE_ADMINS), createUserByAdmin);
router.patch('/profile',  updateProfile);
router.get('/:id',        requireRole(...SERVICE_ADMINS), getUser);
router.patch('/:id',      requireRole(...SERVICE_ADMINS), updateUser);
router.delete('/:id',     requireRole('admin'), deleteUser);

module.exports = router;
