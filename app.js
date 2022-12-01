require('dotenv').config();     // this line should be written as early as possible in the code. It is a package for environment variables to keep the API keys, secret keys safe.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); 

const app = express();

console.log(process.env.API_KEY);   // used to fetch the API_KEY stored in ".env" file

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

// CONNECTION WITH DB.
mongoose.connect("mongodb://localhost:27017/userDB");

// SCHEMA
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// MONGOOSE ENCRYPTION: (always insert this code before creating MODEL)
// plugins are a package code that are add to the mongoose Schema to extend its functionalities.
// secret key used to encrypt or decrypt is stored in ".env" file in this folder.
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});    // add "encrypt" package as a plugin to our "userSchema".   encryptedFields: ["list_of_fields_to_encrypt"]


// MODEL
const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    // NEW DOCUMENT
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        } else{
            res.render("secrets");
        }
    }); 
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    // FIND ONE
    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        } else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                } else{
                    res.send("<h2> Incorrect password </h2>");
                }
            }
        }
    });     
});

app.listen(3000, function(){
    console.log("server started running on PORT 3000");
});