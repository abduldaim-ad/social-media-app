const express = require('express')
const mongoose = require('mongoose')
const Post = require('../../models/post')
const router = express.Router()
const requireLogin = require('../../middlewares/requireLogin')

router.post('/createpost', requireLogin, (req, res) => {
    const { title, desc } = req.body;
    if (!title || !desc) {
        return res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    const post = new Post({
        title,
        desc,
        createdBy: req.user
    })
    post.save()
        .then(() => {
            return res.status(200).json({ msg: "Post Created Successfully!" })
        })
        .catch((err) => {
            return res.status(500).json({ err: `Error while saving the post! ${err}` })
        })
})

router.get('/getuserposts', requireLogin, (req, res) => {
    Post.find({ createdBy: req.user._id })
        .then(allPosts => {
            return res.json(allPosts)
        })
        .catch(err => {
            return res.status(500).json({ err: "Error While Getting All Posts!" })
        })
})

router.delete('/deletepost', requireLogin, (req, res) => {
    const { _id } = req.body;
    Post.findByIdAndDelete(_id)
        .then(() => {
            return res.status(200).json({ msg: "Post Deleted Successfully!" })
        })
        .catch(err => {
            return res.status(500).json({ err: `Error While Deleting the Post! ${err}` })
        })
})

router.put('/updatepost', requireLogin, (req, res) => {
    const { _id, title, desc } = req.body;
    Post.findByIdAndUpdate(_id, { title, desc }, { new: true })
        .then(updatedPost => {
            if (!updatedPost) {
                return res.status(404).json({ err: "Post Not Found!" })
            }
            return res.status(200).json({ msg: "Post Updated Successfully!" })
        })
        .catch(err => {
            return res.status(500).json({ err: `Error While Updating Post! ${err}` })
        })
})

module.exports = router;