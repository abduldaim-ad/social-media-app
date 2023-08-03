const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    createdBy: {
        type: ObjectId,
        ref: "User"
    }
})

const Post = mongoose.model("Post", postSchema)
module.exports = Post