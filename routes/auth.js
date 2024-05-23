const express = require('express')

const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const axios = require('axios')

const JWT_SECRET = "secretjwtstring"

const request = (msg) => console.log("requested for :" + msg)


//Create a User using : POST "/api/auth/createuser" 
router.post('/createuser', [
    body('username').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password').isLength({ min: 8 }),
], async (req, res) => {

    request('createUser')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({ error: errors.array()[0].path + " " + errors.array()[0].msg })
    }
    try {
            let checkUser = await User.findOne({ email: req.body.email, username: req.body.username });

        if (checkUser) {
            return res.status(400).json({ error: "Username or email already used." })
        }
        const salt = await bcrypt.genSalt(10);
        const { username, email, password } = req.body;
        const secPass = await bcrypt.hash(password, salt)
        let user = new User({ username: username, email: email, password: secPass });
        user = await user.save()
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, message: "User created successfully" })

    }
    catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Internal server error occured" })
    }
})

//Authenticate a User using : POST "/api/auth/login" 
router.post('/login', [
    body('username', 'Username cannot be blank').exists(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    request("login");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].path + " " + errors.array()[0].msg })
    }
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Login with correct credentials " })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error: "Login with correct credentials " })
        }

        res.json({ message: "successfully signed in " })


    }
    catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Internal server error occured" })

    }
})

router.get('/getalluser', async (req, res) => {
    try {
        const user = await User.find();
        // res.json(products)
        res.send({ status: 200, user })
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send("Internal server error occured")
    }
})
//Get loggedin User details using : POST "/api/auth/getuser" 
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const id = req.user.id;
        const user = await User.findById(id).select('-password')
        res.send(user);
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Internal server error occured")

    }
})


module.exports = router