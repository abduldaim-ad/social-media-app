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
        .catch(({ err }) => {
            console.log('errr', err)
            return res.status(500).json({ err: `Error while saving the post! ${err}` })
        })
})

router.get('/getuserposts', requireLogin, (req, res) => {
    Post.find({ createdBy: req.user._id })
        .then(allPosts => {
            return res.json(allPosts)
        })
        .catch(err => {
            return res.status(500).json({ err: "Error While Getting Posts of User!" })
        })
})

router.get('/getallposts', requireLogin, async (req, res) => {
    try {
        const posts = await Post.find()
        return res.status(200).json(posts)
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Getting All Posts` })
    }
})

router.get('/getpostdetails', requireLogin, async (req, res) => {
    try {
        const { _id } = req.body
        const postDetails = await Post.findById(_id)
        return res.status(200).json(postDetails)
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Getting Post Details!` })
    }
})

router.delete('/deletepost/:selectedId', requireLogin, async (req, res) => {
    try {
        const { selectedId } = req.params;
        const deletePost = await Post.findById(selectedId)
        if (deletePost.createdBy._id.toString() === req.user._id.toString()) {
            try {
                const deleteStatus = await Post.deleteOne({ _id: deletePost._id })
                return res.status(200).json({ msg: "Post Deleted Successfully!" })
            }
            catch (err) {
                return res.status(500).json({ err: `Error While Deleting Post!` })
            }
        }
        else {
            return res.status(401).json({ err: "Unauthorized User!" })
        }
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Finding the Post! ${err}` })
    }
})

router.put('/updatepost', requireLogin, async (req, res) => {
    const { _id, title, desc } = req.body;
    try {
        const userPost = await Post.findById(_id)
        if (userPost.createdBy._id.toString() === req.user._id.toString()) {
            Post.updateOne(
                { _id: userPost._id },
                { title, desc }
            )
                .then(updatedPost => {
                    if (!updatedPost) {
                        return res.status(404).json({ err: "Post Not Found!" })
                    }
                    return res.status(200).json({ msg: "Post Updated Successfully!" })
                })
                .catch(err => {
                    return res.status(500).json({ err: `Error While Updating Post! ${err}` })
                })
        }
        else {
            return res.status(401).json({ err: "Unauthorized User!" })
        }
    }
    catch (err) {
        return res.status(500).json({ err: `Error While Finding the Post! ${err}` })
    }
})

module.exports = router;