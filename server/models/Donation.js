const mongoose = require ('mongoose');

const DonationSchema = new mongoose.Schema({
    request_id :{ type : mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required : true },
    donor_id : { type : mongoose.Schema.Types.ObjectId, ref : 'DonorProfile', required: true }, 
    donation_date : { type : Date, default : Date.now, required : true},
    units_given : { type : Number, required: true, min : 1},
    remarks : { type : String, maxlength : 200, trim : true}
},{ timestamps : true});

module.exports = mongoose.model('Donation', DonationSchema);