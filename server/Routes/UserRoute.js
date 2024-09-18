const express = require("express");
const UserRoute = express.Router();
const db = require("../utils/db");
const jwt = require("jsonwebtoken");

UserRoute.post("/signup", (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    db.query("Select * from users where email = ?", [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.send({ err: err });
        }
        if (result.length > 0) {
            console.log(result);
            return res.send({ message: "User already exists" });
        }
        else {
            db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send({ err: err });
                }
                return res.send({ message: "User registered successfully" });
            })
        }
    });
    
   
});

UserRoute.post("/login" , (req , res) => {
    console.log(req.body);
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ? AND password = ? ", [email, password], (err, result) => {
        if (err) {
            res.send({err: err});
        }
        if (result.length > 0) {
            // console.log(result[0]);
            const id = result[0].id;
            const token = jwt.sign({id}, "jwtkey", {
                expiresIn: "1d"
            });
            // console.log(id);
            // console.log(result);
            // res.cookie("token" , token, { httpOnly: false });
            res.send({message : "Login Successfull", token :token , user_id : id});
            
        } else {
            res.send({message: "Wrong username or password"});
        }
    });

            
})
module.exports = UserRoute;