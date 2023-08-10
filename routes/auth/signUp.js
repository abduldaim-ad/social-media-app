const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const User = require('../../models/user');
const router = express.Router();

router.post('/signup', (req, res) => {
    console.log(req.body)
    const { username, email, password, cPassword } = req.body;
    if (!username || !email || !password || !cPassword) {
        res.status(422).json({ err: "Please Fill All the Fields" })
    }
    else if (password !== cPassword) {
        res.status(422).json({ err: "Passwords Did Not Match!" })
    }
    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(422).json({ err: "User Already Registered!" });
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        username,
                        email,
                        password: hashedPassword
                    });

                    user.save()
                        .then(() => {
                            res.json({ msg: "Signed Up Successfully!" });
                        })
                        .catch((err) => {
                            res.json({ err: `Error While Signing Up ${err}` });
                        });
                })
        })
        .catch((err) => {
            res.json({ err: `Error While Signing Up ${err}` });
        });
});

module.exports = router;
