const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config()

const cors = require("cors");
const session = require('express-session');
const { collection } = require("./models/userModel");
const app = express();
const PORT = process.env.PORT | 5000

app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected."))
.catch((err) => console.log(err));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
        secret: "ballsballs",
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
})

app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("", require("./routes/routes"));

app.listen(PORT, () => console.log(`Listening at ${PORT}`));
