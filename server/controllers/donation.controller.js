const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

//RECORD A DONATION
exports.recordDonation = async (req, res) => {
  try {
    const { request_id, units_given, remarks } = req.body;

    if (!request_id || !units_given) {
      return res.status(400).json({ message: 'request_id and units_given are required' });
    }

    // Find donor profile
    const donorProfile = await DonorProfile.findOne({ user_id: req.user.id });
    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    // Find the blood request
    const bloodRequest = await BloodRequest.findById(request_id);
    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check request is still pending
    if (bloodRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'This blood request is no longer pending' });
    }

    // Check donor eligibility — 90 day rule
    if (donorProfile.last_donation) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (donorProfile.last_donation > ninetyDaysAgo) {
        const nextEligibleDate = new Date(donorProfile.last_donation);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);
        const daysRemaining = Math.ceil((nextEligibleDate - new Date()) / (1000 * 60 * 60 * 24));
        return res.status(400).json({
          message: `You are not eligible to donate for another ${daysRemaining} days`
        });
      }
    }

    // Record the donation
    const donation = await Donation.create({
      request_id,
      donor_id: donorProfile._id,
      units_given,
      remarks,
      donation_date: new Date()
    });

    // Update donor's last_donation date
    donorProfile.last_donation = new Date();
    await donorProfile.save();

    // Update blood request status to Fulfilled
    bloodRequest.status = 'Fulfilled';
    await bloodRequest.save();

    // Notify the requester
    await Notification.create({
      user_id: bloodRequest.requester_id,
      request_id: bloodRequest._id,
      message: `Great news! Your blood request for ${bloodRequest.patient_name} has been fulfilled.`,
      type: 'In-App'
    });

    // Emit real-time notification to requester
    try {
      const io = getIO();
      io.to(bloodRequest.requester_id.toString()).emit('new_notification', {
        message: `Your blood request for ${bloodRequest.patient_name} has been fulfilled!`,
        request_id: bloodRequest._id
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError.message);
    }

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation
    });

  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY DONATIONS 
exports.getMyDonations = async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ user_id: req.user.id });
    if (!donorProfile) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const donations = await Donation.find({ donor_id: donorProfile._id })
      .populate('request_id', 'patient_name blood_group location urgency')
      .sort({ donation_date: -1 });

    res.status(200).json({
      count: donations.length,
      donations
    });

  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET DONATIONS FOR A REQUEST
exports.getDonationsByRequest = async (req, res) => {
  try {
    const donations = await Donation.find({ request_id: req.params.id })
      .populate('donor_id', 'blood_group location contact_no')
      .sort({ donation_date: -1 });

    res.status(200).json({
      count: donations.length,
      donations
    });

  } catch (error) {
    console.error('Get donations by request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET ALL DONATIONS (ADMIN) 
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor_id', 'blood_group location')
      .populate('request_id', 'patient_name blood_group location')
      .sort({ donation_date: -1 });

    res.status(200).json({
      count: donations.length,
      donations
    });

  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};