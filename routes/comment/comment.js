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

router.get('/getpostcomments', requireLogin, (req, res) => {
    const { postId } = req.body
    Comment.find({ createdBy: req.user._id, postId: postId })
        .then(allComments => {
            return res.status(200).json(allComments)
        })
        .catch((err) => {
            return res.status(500).json({ err: `Error While Getting All Comments of Post! ${err}` })
        })
})

router.get('/getusercomments', requireLogin, async (req, res) => {
    try {
        const userComments = await Comment.find({ createdBy: req.user._id })
        return res.status(200).json(userComments)
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Getting User Comments! ${err}` })
    }
})

router.get('/getallcomments', requireLogin, async (req, res) => {
    try {
        const allComments = await Comment.find()
        return res.status(200).json(allComments)
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Getting All Comments! ${err}` })
    }
})

router.put('/updatecomment', requireLogin, async (req, res) => {
    try {
        const { _id, commentText, postId } = req.body
        const updateComment = await Comment.findById(_id)
        if (updateComment.postId.toString() === postId && updateComment.createdBy._id.toString() === req.user._id.toString()) {
            try {
                const commentStatus = await Comment.updateOne({ _id: updateComment._id }, { commentText })
                return res.status(200).json({ msg: "Comment Updated Successfully!" })
            }
            catch (err) {
                return res.status(500).json({ msg: `Error While Updating Comment! ${err}` })
            }
        }
        else {
            return res.status(401).json({ err: "Unauthorized User or Post!" })
        }
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Finding the Comment! ${err}` })
    }
})

router.delete('/deletecomment', requireLogin, async (req, res) => {
    try {
        const { _id, postId } = req.body
        const deleteComment = await Comment.findById(_id)
        try {
            if (deleteComment.postId.toString() === postId && deleteComment.createdBy._id.toString() === req.user._id.toString()) {
                try {
                    const commentStatus = await Comment.deleteOne({ _id: deleteComment._id })
                    return res.status(200).json({ msg: `Comment Deleted Successfully` })
                }
                catch (err) {
                    return res.status(500).json({ err: `Error While Deleting Comment! ${err}` })
                }
            }
            else {
                return res.status(401).json({ err: "Unauthorized User or Post!" })
            }
        }
        catch (err) {

        }
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Deleting Comment! ${err}` })
    }

    // Comment.findByIdAndDelete(_id)
    //     .then(() => {
    //         return res.status(200).json({ msg: "Post Deleted Successfully!" })
    //     })
    //     .catch((err) => {
    //         return res.status(500).json({ err: `Error While Deleting Comment! ${err}` })
    //     })
})

module.exports = router;