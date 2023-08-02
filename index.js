const dotenv = require('dotenv')
const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express()

dotenv.config();

const PORT = process.env.PORT
const ATLAS_URI = process.env.ATLAS_URI

mongoose.connect(ATLAS_URI, {
    maxPoolSize: 50,
    useNewUrlParser: true,
}).then(() => {
    console.log(`Successfully connected to Social Media App MongoDB Atlas`)
}).catch((err) => {
    console.log(`Error while connecting to Social Media App MongoDB Atlas. Error: ${err}`)
})

app.use(express.json());
app.use(require('./routes/auth/signUp'))
app.use(require('./routes/auth/logIn'))

app.listen(PORT, () => {
    console.log(`Social Media App listening on port ${PORT}`)
})
