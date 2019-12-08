const mongoose = require('mongoose');
const passportLocalMongose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    image: String

});

userSchema.plugin(passportLocalMongose);
module.exports = mongoose.model('User', userSchema)