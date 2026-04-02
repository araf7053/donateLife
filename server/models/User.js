const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name : { type: String , required : true, trim: true, minlength : 2, maxlength : 50},
    email : { type : String , required : true, unique: true, lowercase : true, index: true, match: [/^\S+@\S+\.\S+$/ , 'Please use valid email']},
    password_hash : {type : String, required : true, select : false},
    role : { type : String, enum: ['admin', 'donor', 'requester'], default : 'donor'},
    is_active : { type : Boolean, default: true },
    
}, {
    timestamps : true
});

module.exports = mongoose.model('User', UserSchema);