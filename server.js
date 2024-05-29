const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const cors = require("cors");
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected."))
.catch((err) => console.log(err));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: "secretKey",
    saveUninitialized: true,
    resave: false,
})
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("", require("./routes/routes"));

app.get("/chat", (req, res) => {
    res.render("chat");
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        // Echo the message back down the socket to all connected clients
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => console.log(`Listening at ${PORT}`));
