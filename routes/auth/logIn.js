const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user');
const router = express.Router();

const jwtsecret = process.env.JWTSECRET

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(password)
    if (!email || !password) {
        return res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(422).json({ err: "Email or Password is Invalid!" })
    }

    const compare = await bcrypt.compare(password, user.password);
    if (compare) {
        var token = jwt.sign({ _id: user._id }, jwtsecret);
        const { _id, username, email } = user;
        return res.json({ token, user: { _id, username, email } })
    } else {
        return res.status(422).json({ err: "Email or Password is Invalid!" })
    }
});

module.exports = router
