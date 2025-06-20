const express = require('express');

const { route } = require('./ownersRouter');
const router = express.Router();
const {registerUser , loginUser, logoutUser }= require('../controllers/authController');


router.get("/", (req, res) => {
    res.send("Users route working");
});

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logoutUser);

module.exports = router;
