const express = require('express');
const router = express.Router();
const {
  recordDonation,
  getMyDonations,
  getDonationsByRequest,
  getAllDonations
} = require('../controllers/donation.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', authorize('donor'), recordDonation);
router.get('/my', authorize('donor'), getMyDonations);
router.get('/request/:id', getDonationsByRequest);
router.get('/', authorize('admin'), getAllDonations);

module.exports = router;