const mongoose = require('mongoose');

const DonorProfileSchema = new mongoose.Schema({
    user_id : { type : mongoose.Schema.Types.ObjectId, ref:'User', required : true, unique : true},
    
    blood_group : {type : String, required :true, index: true, enum :['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+','O-']},
    location : {
        city : { type : String, required : true, index : true },
        pincode: {type : String, required : true}
    },
    contact_no : { type : String , required : true, match: [/^[0-9]{10}$/, 'Invalid phone number']},
    last_donation : { type : Date, default : null },
    is_available : {type : Boolean, default: true}
},{
   timestamps: true 
});

module.exports = mongoose.model('DonorProfile', DonorProfileSchema );