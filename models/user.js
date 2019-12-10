const mongoose = require('mongoose');
const passportLocalMongose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        secure_url:{ type: String, default: '/images/default-profile.jpg' },
        public_id: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date

});

userSchema.plugin(passportLocalMongose);
module.exports = mongoose.model('User', userSchema)