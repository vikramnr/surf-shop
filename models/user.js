const mongoose = require('mongoose');
const passportLocalMongose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    image: String,
    post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],

});

userSchema.plugin(passportLocalMongose);
module.exports = mongoose.model('User', userSchema)