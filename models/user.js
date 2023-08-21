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
    requestedId: {
        type: Array, default: ''
    },
    receivedId: {
        type: Array, default: ''
    },
    friendsList: [{
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        friendEmail: { type: String, default: '' }
    }],
    totalRequest: { type: Number, default: 0 }
})

const User = mongoose.model('User', userSchema);
module.exports = User;
