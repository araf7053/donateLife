const mongoose = require ('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id : { type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true, index : true},
    request_id : { type : mongoose.Schema.Types.ObjectId, ref: 'BloodRequest'},
    message : { type : String , required: true, trim: true, maxlength : 500},
    type : { type : String, enum :[ 'In-App', 'E-mail', 'SMS'], default : 'In-App'},
    is_read :{ type : Boolean, default : false, index : true},
},{ timestamps : true});
module.exports = mongoose.model('Notification', NotificationSchema);