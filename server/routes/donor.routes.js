const express = require('express');
const router = express.Router();
const {
  createDonorProfile,
  getMyProfile,
  updateDonorProfile,
  searchNearbyDonors,
  checkEligibility
} = require('../controllers/donor.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/profile', authorize('donor'), createDonorProfile);
router.get('/profile', authorize('donor'), getMyProfile);
router.put('/profile', authorize('donor'), updateDonorProfile);
router.get('/search', searchNearbyDonors);
router.get('/eligibility', authorize('donor'), checkEligibility);

module.exports = router;