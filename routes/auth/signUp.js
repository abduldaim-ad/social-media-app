const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const User = require('../../models/user');
const router = express.Router();
const requireLogin = require('../../middlewares/requireLogin')

router.post('/signup', (req, res) => {
    console.log(req.body)
    const { username, email, password, cPassword } = req.body;
    if (!username || !email || !password || !cPassword) {
        return res.status(422).json({ err: "Please Fill All the Fields" })
    }
    else if (password !== cPassword) {
        return res.status(422).json({ err: "Passwords Did Not Match!" })
    }
    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(422).json({ err: "User Already Registered!" });
            }
            User.findOne({ username })
                .then((existingUsername) => {
                    if (existingUsername) {
                        return res.status(422).json({ err: "Username Already Exists!" });
                    }
                    else {
                        bcrypt.hash(password, 12)
                            .then(hashedPassword => {
                                const user = new User({
                                    username,
                                    email,
                                    password: hashedPassword
                                });

                                user.save()
                                    .then(() => {
                                        return res.json({ msg: "Signed Up Successfully!" });
                                    })
                                    .catch((err) => {
                                        return res.json({ err: `Error While Signing Up ${err}` });
                                    });
                            })
                    }
                })
                .catch((err) => {
                    return res.json({ err: `Error While Signing Up ${err}` });
                });
        })
        .catch((err) => {
            return res.json({ err: `Error While Signing Up ${err}` });
        });
});

router.put('/updateusername', requireLogin, async (req, res) => {
    const { _id, username } = req.body;
    if (!username) {
        return res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    try {
        const exists = await User.findOne({ username })
        if (exists) {
            return res.status(422).json({ err: "Username Already Exists!" });
        }
        else {
            const user = await User.findById(_id);
            if (user) {
                const update = await User.updateOne({ _id: user._id }, { username })
                if (update) {
                    return res.status(200).json({ msg: "Username Updated Successfully!" })
                }
                else {
                    return res.status(500).json({ err: "Error While Updating Username!" })
                }
            }
            else {
                return res.status(404).json({ err: "User Not Found!" })
            }
        }
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Updating Username!" });
    }
})

router.put('/updatepassword', requireLogin, async (req, res) => {
    const { _id, oldPassword, password, cPassword } = req.body;
    if (!oldPassword || !password || !cPassword) {
        return res.status(422).json({ err: "Please Fill All the Fields!" });
    }
    const user = await User.findById(_id);
    if (user) {
        const compare = await bcrypt.compare(oldPassword, user.password);
        if (compare) {
            if (password !== cPassword) {
                return res.status(422).json({ err: "Passwords Did Not Match!" });
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 12);
                if (hashedPassword) {
                    const update = await User.updateOne({ _id: user._id }, { password: hashedPassword })
                    if (update) {
                        return res.status(200).json({ msg: "Password Updated Successfully!" })
                    }
                    else {
                        return res.status(500).json({ err: "Error While Updating Password!" })
                    }
                }
            }
        }
        else {
            return res.status(401).json({ err: "Invalid Current Password!" });
        }
    }
    else {
        return res.status(404).json({ err: "User Not Found!" })
    }
})

module.exports = router;
