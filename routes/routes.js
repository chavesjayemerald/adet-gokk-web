const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Manga = require("../models/mangaModel");
const User = require("../models/userModel");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads");
    }, filename: function(req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        req.session.message = {
            type: 'danger',
            message: 'You must be logged in to view this page',
        };
        res.redirect('/');
    }
};

var uploadCover = multer({
    storage: storage,
}).single('coverImg');

router.post('/add', requireLogin, uploadCover, (req, res) => {
    const manga = new Manga({
        title: req.body.title,
        description: req.body.description,
        coverImg: req.file.filename,
    });

    manga.save()
        .then(() => {
            req.session.message = {
                type: "success",
                message: "Manga Added Successfully"
            };
            res.redirect("/home");
        })
        .catch(err => {
            res.json({message: err.message, type: "danger"});
        });

});

router.post('/signup', async (req, res) => {
    const {username, password} = req.body;

    try {
        const existingUser = await User.findOne({username});
        if(existingUser) return res.status(400).json({error: 'Username is already taken.'});

        const user = new User({username, password});
        const savedUser = await user.save();

        req.session.user = savedUser;
        return res.redirect('/home');
    } catch (err) {
        res.status(500).json({error: 'Server error, please try again.'});
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.collection.findOne({username: req.body.username});
        if(!user) return res.status(400).send("Username not found!");
        if(user.password !== req.body.password) return res.status(400).send("Wrong password!");

        req.session.user = user;
        return res.redirect("/home");
    } catch(e) {
        console.log(e);
        res.status(500).send("Error Occurred!");
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    })
});

router.get("/home", requireLogin, (req, res) => {
    Manga.find().exec()
        .then(mangas => {
            res.render("index", {
                title: "Home-Page",
                mangas: mangas,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

router.get("/add", requireLogin, (req, res) => { 
    res.render("addmanga", { title: "Add Mangas" });
});

router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    Manga.findById(id)
      .then(manga => {
          if(!manga) {
              res.redirect("/home");
          }else{
              res.render("editmanga", {
                  title: "Edit Manga",
                  manga: manga,
              });
          }
      })
      .catch(err => {
        console.log(err);
        res.redirect("/");
      });
  });

router.post("/update/:id", uploadCover, async (req, res) => {
    let newcoverImg = "";
    
    if (req.file) {
        newcoverImg = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.oldcoverImg);
        } catch (err) {
            console.log(err);
        }
    } else {
        newcoverImg = req.body.oldcoverImg;
    }
    
    const updatedManga = {
        title: req.body.title,
        description: req.body.description,
        coverImg: newcoverImg
    };
    
    try {
        await Manga.findByIdAndUpdate(req.params.id, updatedManga, {new: true});
        
        req.session.message = {
            type: "success",
            message: "Manga updated successfully."
        };
        res.redirect("/home");

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/delete/:id", async (req, res) => {
    try {
        let manga = await Manga.findById(req.params.id);
        if(manga.coverImg != ""){
            fs.unlinkSync("./uploads/"+manga.coverImg);
        }

        await Manga.findByIdAndDelete(req.params.id);
        req.session.message = {
            type: "info",
            message: "Manga deleted Successfully!"
        };
        res.redirect("/home");
    } 
    catch(err){
        console.log(err);
        res.json({ message: err.message });
    }
});

module.exports = router;