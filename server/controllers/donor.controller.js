

const DonorProfile = require('../models/DonorProfile');
const { getCoordinates } = require('../services/geoService');

//  CREATE DONOR PROFILE 
exports.createDonorProfile = async (req, res) => {
  try {
    // Check if profile already exists
    const existing = await DonorProfile.findOne({ user_id: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'Donor profile already exists' });
    }

    const { blood_group, city, pincode, contact_no } = req.body;

    // Get coordinates from city name using OpenCage
    const { latitude, longitude, formattedAddress } = await getCoordinates(city);

    const profile = await DonorProfile.create({
      user_id: req.user.id,
      blood_group,
      location: { city, pincode },
      geoLocation: {
        type: 'Point',
        coordinates: [longitude, latitude] // MongoDB requires [lng, lat]
      },
      contact_no
    });

    res.status(201).json({
      message: 'Donor profile created successfully',
      profile
    });

  } catch (error) {
    console.error('Create donor profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

//  GET MY DONOR PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user_id: req.user.id })
      .populate('user_id', 'name email'); // attach name and email from User

    if (!profile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.status(200).json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  UPDATE DONOR PROFILE 
exports.updateDonorProfile = async (req, res) => {
  try {
    const { blood_group, city, pincode, contact_no, is_available } = req.body;

    const profile = await DonorProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    // If city is being updated, get new coordinates
    if (city) {
      const { latitude, longitude } = await getCoordinates(city);
      profile.geoLocation = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
      profile.location.city = city;
    }

    // Update other fields only if provided
    if (pincode) profile.location.pincode = pincode;
    if (blood_group) profile.blood_group = blood_group;
    if (contact_no) profile.contact_no = contact_no;
    if (is_available !== undefined) profile.is_available = is_available;

    await profile.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// SEARCH NEARBY DONORS 
// Query params: blood_group, city, maxDistance (in km, default 10)
exports.searchNearbyDonors = async (req, res) => {
    // console.log('Query params:', req.query);   { used for testing}
  try {
    const { blood_group, city, maxDistance = 10 } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City is required for search' });
    }

    // Convert city to coordinates
    const { latitude, longitude } = await getCoordinates(city);

    // Build query
    const query = {
      is_available: true,
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance * 1000 // convert km to meters
        }
      }
    };

    // Filter by blood group if provided
    if (blood_group) {
      query.blood_group = blood_group;
    }

    // Eligibility filter — donor must not have donated in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    query.$or = [
      { last_donation: null },
      { last_donation: { $lte: ninetyDaysAgo } }
    ];

    const donors = await DonorProfile.find(query)
      .populate('user_id', 'name email')
      .select('-geoLocation'); // don't expose raw coordinates to frontend

    res.status(200).json({
      count: donors.length,
      donors
    });

  } catch (error) {
    console.error('Search donors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// CHECK ELIGIBILITY
exports.checkEligibility = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user_id: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    // No donation recorded yet — eligible
    if (!profile.last_donation) {
      return res.status(200).json({ eligible: true, message: 'You are eligible to donate' });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    if (profile.last_donation <= ninetyDaysAgo) {
      return res.status(200).json({ eligible: true, message: 'You are eligible to donate' });
    }

    // Calculate days remaining
    const nextEligibleDate = new Date(profile.last_donation);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);
    const daysRemaining = Math.ceil((nextEligibleDate - new Date()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      eligible: false,
      message: `You can donate again in ${daysRemaining} days`,
      nextEligibleDate
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};