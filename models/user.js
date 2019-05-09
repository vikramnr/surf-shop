const mongoose = require('mongoose')
const User = mongoose.Schema ({
    email: String,
    password: String,
    username: String,
    post: [],

})
