const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/user');
const requireLogin = require('../../middlewares/requireLogin')
const router = express.Router();

const jwtsecret = process.env.JWTSECRET

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
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

router.get('/getusername/:postedBy', requireLogin, async (req, res) => {
    const { postedBy } = req.params;
    try {
        const username = await User.findById(postedBy)
        return res.status(200).json(username)
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Getting Username!" })
    }
})

router.get('/getuserdetails/:_id', requireLogin, async (req, res) => {
    const { _id } = req.params;
    try {
        const user = await User.findById(_id);
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Getting User Details!" })
    }
})

router.get('/searchusers/:searchUser', requireLogin, async (req, res) => {
    const { searchUser } = req.params;
    if (!searchUser) {
        return res.status(500).json({ err: "Please Fill All the Fields!" });
    }
    try {
        const user = await User.find({ username: { $regex: searchUser } });
        return res.status(200).json(user);
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Getting Users!" })
    }
})

router.put('/sendrequest', requireLogin, async (req, res) => {

    const { accountId, requestedId, receivedUsername } = req.body;

    if (!accountId || !requestedId || !receivedUsername) {
        return res.status(422).json({ err: "Id Must Not Be Empty!" })
    }
    const check = await User.findById(requestedId);
    if (check.friendsUsername.includes(receivedUsername)) {
        console.log("Yes")
        return res.status(422).json({ err: "Already a Friend!" })
    }
    try {
        const sentRequest = await User.findByIdAndUpdate(
            accountId,
            {
                "$push": { requestedId },
            },
            { "new": true, "upsert": true }
        );
        if (sentRequest) {
            try {
                const receivedRequest = await User.findByIdAndUpdate(
                    requestedId,
                    {
                        "$push": { receivedId: accountId, receivedUsername }
                    },
                    { "new": true, "upsert": true }
                );
                if (receivedRequest) {
                    return res.status(200).json({ msg: "Request Sent Successfully!" });
                }
                else {
                    return res.status(422).json({ err: "Request Already Received!" });
                }
            }
            catch (err) {
                return res.status(500).json({ err: "Error While Sending Request!" });
            }
        }
        else {
            return res.status(422).json({ err: "Request Already Sent!" });
        }
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Sending Request!!!" });
    }
})

router.put('/acceptrequest', requireLogin, async (req, res) => {

    const { accountId, requestedId, accountUsername, receivedUsername } = req.body;

    if (!accountId || !requestedId || !accountUsername || !receivedUsername) {
        return res.status(422).json({ err: "Please Fill All the Fields!" })
    }
    try {
        const acceptRequest = await User.findByIdAndUpdate(
            accountId,
            {
                "$push": { friendsUsername: receivedUsername },
                "$pull": { receivedId: requestedId },
                "$pull": { receivedUsername: receivedUsername }
            },
            { "new": true, "upsert": true }
        );
        if (acceptRequest) {
            try {
                const acceptRequest2 = await User.findByIdAndUpdate(
                    requestedId,
                    {
                        "$push": { friendsUsername: accountUsername },
                        "$pull": { requestedId: accountId }
                    },
                    { "new": true, "upsert": true }
                );
                if (acceptRequest2) {
                    return res.status(200).json({ msg: "Request Accepted Successfully!" });
                }
                else {
                    return res.status(422).json({ err: "Error While Accepting Request!" });
                }
            }
            catch (err) {
                return res.status(500).json({ err: "Error While Accepting Request!!" });
            }
        }
        else {
            return res.status(422).json({ err: "Request Already Accepted!" });
        }
    }
    catch (err) {
        return res.status(500).json({ err: "Error While Accepting Request!!!" });
    }
})

router.get('/checkrequest/:requestedId', requireLogin, async (req, res) => {
    const { requestedId } = req.params;
    try {
        const check = await User.find({ requestedId: { $in: [requestedId] } });
        if (check) {
            return res.json({ msg: true })
        }
        else {
            return res.json({ msg: false })
        }
    }
    catch (err) {
        return res.json({ err: "Error While Checking Request!" })
    }
})

module.exports = router
