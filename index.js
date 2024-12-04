const dotenv = require('dotenv')
const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express()
const http = require('http');
var cors = require('cors');
const User = require('./models/user');
const { Server } = require('socket.io');

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

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (process.env.NODE_ENV === "production")
            ?
            'https://facebook-fbclone.vercel.app/'
            :
            'http://localhost:5000/',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for user registration event
    socket.on('register_user', async (userId) => {
        console.log('Register User');
        // console.log('Here is sender Id', userId);
        const update = await User.updateOne({ _id: userId }, { socketId: socket.id })
    });

    // Listen for friend request event
    socket.on('friend_request', async (data) => {
        const update = await User.findById(data.receiverId);
        console.log("update", update)
        if (update) {
            const receiverSocketId = update.socketId;
            if (receiverSocketId) {
                try {
                    io.to(receiverSocketId).emit('receive_request', data);
                    console.log('Emit Friend Request');
                }
                catch (error) {
                    console.log("Errorrr", error);
                }

            }
        }
    });

    socket.on('disconnect', async () => {
        console.log('A user disconnected');
        //Remove disconnected user from users data structure
        const update = await User.findOneAndUpdate({ socketId: socket.id }, { socketId: "" });
    });
});

app.use(express.json());
app.use(require('./routes/auth/signUp'))
app.use(require('./routes/auth/logIn'))

app.use(require('./routes/post/post'))

app.use(require('./routes/comment/comment'))

if (process.env.NODE_ENV === "production") {
    const path = require("path");
    app.use(express.static(path.resolve(__dirname, 'build')));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'), function (err) {
            if (err) {
                res.status(500).send(err)
            }
        });
    })
}

server.listen(PORT, () => {
    console.log(`Social Media App listening on port ${PORT}`)
})
