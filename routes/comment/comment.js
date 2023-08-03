const express = require('express')
const mongoose = require('mongoose')
const Comment = require('../../models/comment')
const requireLogin = require('../../middlewares/requireLogin')
const router = express.Router()

router.post('/postcomment', requireLogin, (req, res) => {
    const { commentText, postId } = req.body;
    if (!commentText) {
        return res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    const comment = new Comment({
        commentText,
        createdBy: req.user,
        postId
    })
    comment.save()
        .then(() => {
            return res.status(200).json({ msg: "Comment Posted Successfully!" })
        })
        .catch((err) => {
            return res.status(500).json({ err: `Error While Posting Comment! ${err}` })
        })
})

router.get('/getallpostcomments', requireLogin, (req, res) => {
    const { postId } = req.body
    Comment.find({ createdBy: req.user._id, postId: postId })
        .then(allComments => {
            return res.status(200).json(allComments)
        })
        .catch((err) => {
            return res.status(500).json({ err: `Error While Getting All Comments of Post! ${err}` })
        })
})

router.put('/updatecomment', requireLogin, (req, res) => {
    const { _id, commentText } = req.body
    Comment.findByIdAndUpdate(_id, { commentText }, { new: true })
        .then(() => {
            return res.status(200).json({ msg: "Comment Updated Successfully!" })
        })
        .catch((err) => {
            return res.status({ err: `Error While Updating Comment! ${err}` })
        })
})

router.delete('/deletecomment', requireLogin, (req, res) => {
    const { _id } = req.body
    Comment.findByIdAndDelete(_id)
        .then(() => {
            return res.status(200).json({ msg: "Post Deleted Successfully!" })
        })
        .catch((err) => {
            return res.status(500).json({ err: `Error While Deleting Comment! ${err}` })
        })
})

module.exports = router;