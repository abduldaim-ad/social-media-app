const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String
    },
    requestedId: {
        type: Array
    },
    receivedId: {
        type: Array
    },
    receivedUsername: {
        type: Array
    },
    friendsUsername: {
        type: Array
    },
    socketId: {
        type: String,
    }
    // totalRequest: { type: Number, default: 0 }
})

const User = mongoose.model('User', userSchema);
module.exports = User;
