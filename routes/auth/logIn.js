const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user');
const router = express.Router();

const jwtsecret = process.env.JWTSECRET

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    User.findOne({ email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ err: "Email or Password is Invalid!" })
            }
            bcrypt.compare(password, savedUser.password)
                .then(checkMatch => {
                    if (checkMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, jwtsecret)
                        const { _id, username, email } = savedUser
                        res.json({ token, user: { _id, username, email } })
                    }
                    else {
                        return res.status(422).json({ err: "Email or Password is Invalid!" })
                    }
                })
        })
});

module.exports = router
