const mongoose = require ('mongoose');

const BloodRequestSchema = new mongoose.Schema({
    requester_id : { type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    patient_name : { type: String  , required: true, trim : true, minlength : 2},
    blood_group : { type: String , required :true ,  enum :['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+','O-']},
    units_needed : { type : Number, required :true, min:1 },
    location : {
        city : { type : String , required: true },
        hospital : { type : String }
       
    },
     urgency : { type : String, enum : ['Normal', 'Critical'], defualt : 'Normal'},
     status :  { type : String , enum : ['Pending', 'Fulfilled', 'Cancelled'], default : 'Pending'},
},{
    timestamps:true });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);