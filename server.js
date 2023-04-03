const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");

const initializePassport = require("./passportConfig");
initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: "thefolk", 

    resave: false,

    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get("/", (req, res)=>{
    res.render("dashboard");
});

app.get("/users/register", checkLogged, (req, res)=>{
    res.render("register");
});

app.get("/users/login", checkLogged, (req, res)=>{
    res.render("login");
});

app.get("/users/dashboard", checkNotLogged, (req, res) => {
    res.render("dashboard", { user: req.user.name });
});

app.get("/users/logout", (req, res)=>{
    req.logOut();
    res.redirect("/users/login")
})

app.get("/users/about", (req, res)=>{
    res.render("about");
});

app.get("/users/search", checkNotLogged, (req, res)=>{
    res.render("search");
});

app.get("/users/forum", checkNotLogged, (req, res)=>{
    res.render("forum");
});

app.get("/users/paris", (req, res)=>{
    res.render("paris");
});

app.get("/users/NewYork", (req, res)=>{
    res.render("NewYork");
});

app.get("/users/tokyo", (req, res)=>{
    res.render("tokyo");
});

app.get("/users/locationtest", checkNotLogged, (req, res)=>{
    res.render("locationtest");
});

app.post("/users/register", async (req, res) => {
    let { name, email, password, password2 } = req.body;

    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({message: "Please fill all fields."});
    }

    if(password.length < 6){
        errors.push({message: "Minimum password length of 6."});
    }

    if(password != password2){
        errors.push({message: "Passwords do not match."});
    }

    var count = 0;
    for(var i=0; i<password.length; i++){
        if(password[i] == password[i].toUpperCase()){
            count++;
        }
    }

    if(count == 0){
        errors.push({message: "Password must contain at least 1 upper case letter."})
    }

    if(errors.length > 0){
        res.render('register', {errors});
    }

    else{
        let hashedPass = await bcrypt.hash(password, 10);
        console.log(hashedPass);

    pool.query(
        `SELECT * FROM users
        WHERE email = $1`, 
        [email], 
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

                if(results.rows.length > 0){
                    errors.push({message: "Email is already in use with another KnowLo account."});
                    res.render('register', {errors});
                }

                else{
                    pool.query(
                        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password`,
                        [name, email, hashedPass], (err, results)=>{
                            if (err){
                                throw err;
                            }
                            console.log(results.row);
                            req.flash("success_msg", "Sign up complete, Log in!");
                            res.redirect("/users/login")
                        }
                    );
                }
            }
        );
    }
});

app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));

function checkLogged(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotLogged(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/users/login");
}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});