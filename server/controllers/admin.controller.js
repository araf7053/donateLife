const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

// DASHBOARD STATS 
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      totalDonations
    ] = await Promise.all([
      User.countDocuments(),
      DonorProfile.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'Pending' }),
      BloodRequest.countDocuments({ status: 'Fulfilled' }),
      Donation.countDocuments()
    ]);

    // Blood group distribution among donors
    const bloodGroupStats = await DonorProfile.aggregate([
      { $group: { _id: '$blood_group', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Donations per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const donationsPerMonth = await Donation.aggregate([
      { $match: { donation_date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$donation_date' },
            month: { $month: '$donation_date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalDonors,
        totalRequests,
        pendingRequests,
        fulfilledRequests,
        totalDonations
      },
      bloodGroupStats,
      donationsPerMonth
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET ALL USERS 
exports.getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    const query = {};
    if (role) query.role = role;
    if (is_active !== undefined) query.is_active = is_active === 'true';

    const users = await User.find(query)
      .select('-password_hash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET SINGLE USER
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get donor profile if exists
    const donorProfile = await DonorProfile.findOne({ user_id: req.params.id });

    res.status(200).json({ user, donorProfile });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  DEACTIVATE / ACTIVATE USER 
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.is_active = !user.is_active;
    await user.save();

    res.status(200).json({
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: user.is_active
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete all related data
    await DonorProfile.deleteOne({ user_id: req.params.id });
    await Notification.deleteMany({ user_id: req.params.id });
    await user.deleteOne();

    res.status(200).json({ message: 'User and all related data deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET ALL BLOOD REQUESTS 
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requester_id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL DONATIONS 
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
    console.error('Admin get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};