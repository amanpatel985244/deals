const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const usermodel = require("../models/user-model");
const {generateToken} = require("../utils/generateToken");
const userModel = require("../models/user-model");

module.exports.registerUser=async function  (req,res){
try{
        let {email,password,fullname} = req.body;
        let user = await userModel.findOne({email:email});
        if(user)return res.status(401).send("You have already an Account, Please login");

        bcrypt.genSalt(10,function (err , salt){
      bcrypt.hash(password , salt , async function(err , hash){
        if(err) return res.send(err.message);
        else {
     let user =   await usermodel.create({
        email,
        password : hash,
        fullname
    })
 let token =   generateToken(user)
    res.cookie = ("token", token);
    res.redirect("/shop");
    }
      })
        })
 
    }
catch (err){
res.send(err.message);
}
}

module.exports.loginUser=async function  (req,res){
   let {email , password} = req.body;
   let user = await userModel.findOne({email:email});
   if(!user)return res.status(500).send("Email and Password Incorrect");

   bcrypt.compare(password, user.password , function (err, result){
    if(result){
        let token = generateToken(user);
        res.cookie("token" , token);
         res.redirect("/shop");
    }
    else{
        return res.status(500).send("Email and Password Incorrect");
    }
   })
}
module.exports.logoutUser = async function (req, res) {
    try {
        // Clear the token cookie
     

res.clearCookie("token");
res.redirect("/login");

    } catch (err) {
        res.status(500).send(err.message);
    }
};
