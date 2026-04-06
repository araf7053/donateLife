const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getAllRequests,
  getAllDonations
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All admin routes require login and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/requests', getAllRequests);
router.get('/donations', getAllDonations);

module.exports = router;