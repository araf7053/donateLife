const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const DonorProfile = require('../models/DonorProfile');
const { getIO } = require('../config/socket');

// CREATE BLOOD REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { patient_name, blood_group, units_needed, city, hospital, urgency } = req.body;

    if (!patient_name || !blood_group || !units_needed || !city) {
      return res.status(400).json({ message: 'patient_name, blood_group, units_needed and city are required' });
    }

    const request = await BloodRequest.create({
      requester_id: req.user.id,
      patient_name,
      blood_group,
      units_needed,
      location: { city, hospital },
      urgency: urgency || 'Normal'
    });

    // DEBUG LINES
    // const allDonors = await DonorProfile.find({ blood_group });
    // console.log('Blood group searching for:', blood_group);
    // console.log('All donors with this blood group:', allDonors.length);
    // console.log('Donor details:', JSON.stringify(allDonors, null, 2));

    // Find eligible donors with matching blood group
    const eligibleDonors = await DonorProfile.find({
      blood_group,
      is_available: true,
      $or: [
        { last_donation: null },
        { last_donation: { $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
      ]
    });

    console.log('Eligible donors found:', eligibleDonors.length);

    // Create in-app notification for each eligible donor
    const notifications = eligibleDonors.map(donor => ({
      user_id: donor.user_id,
      request_id: request._id,
      message: `Urgent: ${blood_group} blood needed for ${patient_name} at ${hospital || city}. Can you help?`,
      type: 'In-App'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Emit real-time notification to each donor via Socket.io
      try {
        const io = getIO();
        eligibleDonors.forEach(donor => {
          io.to(donor.user_id.toString()).emit('new_notification', {
            message: `Urgent: ${blood_group} blood needed at ${hospital || city}`,
            request_id: request._id
          });
        });
      } catch (socketError) {
        console.error('Socket emit error:', socketError.message);
        // Don't fail the request if socket fails
      }
    }

    res.status(201).json({
      message: 'Blood request created successfully',
      request,
      notifiedDonors: eligibleDonors.length
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET ALL REQUESTS 
// Public — anyone logged in can see open requests
exports.getAllRequests = async (req, res) => {
  try {
    const { blood_group, city, status, urgency } = req.query;

    const query = {};
    if (blood_group) query.blood_group = blood_group;
    if (city) query['location.city'] = { $regex: city, $options: 'i' }; // case insensitive
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('requester_id', 'name email')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET SINGLE REQUEST 
exports.getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester_id', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.status(200).json({ request });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY REQUESTS 
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester_id: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  UPDATE REQUEST STATUS 
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Fulfilled', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Only the requester or admin can update status
    if (request.requester_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: 'Request status updated',
      request
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE REQUEST 
exports.deleteRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Only requester or admin can delete
    if (request.requester_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    // Only pending requests can be deleted
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }

    await request.deleteOne();

    res.status(200).json({ message: 'Blood request deleted successfully' });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};