const express = require('express')
const mongoose = require('mongoose')
const Post = require('../../models/post')
const router = express.Router()
const requireLogin = require('../../middlewares/requireLogin')

const cloudinary = require("cloudinary").v2;
const Multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const storage = new Multer.memoryStorage();
const upload = Multer({
    storage,
});

async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
    return res;
}

router.post("/createpost", upload.single("my_file"), async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        console.log("IsUser", req.user);
        const { title, desc, userId } = req.body;
        if (!title || !desc) {
            return res.status(422).json({ err: "Please Fill All the Fields!" })
        }
        const post = new Post({
            title,
            desc,
            photo: cldRes.secure_url,
            createdBy: userId
        })
        post.save()
            .then(() => {
                return res.status(200).json({ msg: "Post Created Successfully!" })
            })
            .catch(({ err }) => {
                return res.status(500).json({ err: `Error while saving the post! ${err}` })
            })

    } catch (error) {
        console.log(error);
        res.send({
            message: error.message,
        });
    }
});

// router.post('/createpost', requireLogin, (req, res) => {
//     const { title, desc, photo } = req.body;
//     if (!title || !desc || !photo) {
//         return res.status(422).json({ err: "Please Fill All the Fields!" })
//     }
//     const post = new Post({
//         title,
//         desc,
//         photo,
//         createdBy: req.user
//     })
//     post.save()
//         .then(() => {
//             return res.status(200).json({ msg: "Post Created Successfully!" })
//         })
//         .catch(({ err }) => {
//             return res.status(500).json({ err: `Error while saving the post! ${err}` })
//         })
// })

router.get('/getuserposts/:_id', requireLogin, (req, res) => {
    const _id = req.params;
    Post.find({ createdBy: _id })
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

router.put('/updatepost', upload.single("my_file"), async (req, res) => {

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);

    const { _id, userId, title, desc } = req.body;
    try {
        const userPost = await Post.findById(_id)
        if (userPost.createdBy._id.toString() === userId.toString()) {
            Post.updateOne(
                { _id: userPost._id },
                {
                    title,
                    desc,
                    photo: cldRes.secure_url
                }
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