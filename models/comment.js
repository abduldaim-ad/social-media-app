const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const commentSchema = mongoose.Schema({
    commentText: {
        type: String,
        required: true
    },
    createdBy: {
        type: ObjectId,
        ref: "User"
    },
    postId: {
        type: ObjectId,
        ref: "Post"
    }
})

const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment