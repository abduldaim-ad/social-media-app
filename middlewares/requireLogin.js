const mongoose = require('mongoose')
const User = mongoose.model("User")
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')
dotenv.config()

const jwtsecret = process.env.JWTSECRET

const requireLogin = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ err: "LogIn Required!" })
    }
    const token = authorization.replace("Bearer ", "").toString().trim();
    const decoded = jwt.verify(token, jwtsecret);
    const { _id } = decoded;

    const user = await User.findById(_id);
    if (user) {
        req.user = user;
        next()
    }
}

module.exports = requireLogin;