const mongoose = require('mongoose')
const User = mongoose.model("User")
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')
dotenv.config()

const jwtsecret = process.env.JWTSECRET

const requireLogin = (req, res, next => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ err: "LogIn Required" })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify((token, jwtsecret, (err, payload) => {
        if (err) {
            res.status(401).json({ err: "LogIn Required" })
        }
        const { _id } = payload
        User.findById(_id)
            .then(savedUser => {
                req.user = savedUser
                next()
            })
    }))
})

module.exports = requireLogin;