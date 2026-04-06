const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  getMyRequests,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/request.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect); // all routes require login

router.post('/', authorize('requester', 'admin'), createRequest);
router.get('/', getAllRequests);
router.get('/my', getMyRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);
router.delete('/:id', deleteRequest);

module.exports = router;