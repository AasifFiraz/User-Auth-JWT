const express = require("express")
const User = require("../model/user")
const crypto = require ("crypto");
const jwt = require("jsonwebtoken")
const router = express.Router()
const auth = require("../middleware/auth")
require("dotenv").config()

const algorithm = "aes-256-cbc"; 
// 32 Characters Neccessary for secret key

const encryptPassword = (password) => {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, process.env.SECRET_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(password), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
}

const decryptPassword = (iv, content) => {
    const decipher = crypto.createDecipheriv(algorithm, process.env.SECRET_KEY, Buffer.from(iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

    return decrpyted.toString();
}

router.post('/register', async(req, res) => {
    try {
        // Get User Input
        const {username, email, password} = req.body

        // Validate User Input
        if (!(email && password && username)) {
            res.status(400).json({error: "All input is required"});
        }

        // Check if user already exists
        const isExistingUser = await User.findOne({ email })
        if(isExistingUser){
            return res.status(409).json({"error": "Email already exists. Please Login"})
        }

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptPassword(password), // Encrypt User Password 
        })
        // Return new user
        res.status(200).json(user)
        initVectorGlob = ""
    } catch (error) {
        res.status(500).json(error)
    }
});

router.post('/login', async(req, res) => {
    try {
        
        const {email, password} = req.body

        if (!(email && password)) {
            res.status(400).json({error:"All input is required"});
        }

        const user = await User.findOne({ email });
        const {iv, content} = user.password
        
        if (user && decryptPassword(iv, content) === password) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "2h",
                }
              );

            user.token = token;
            // user
            return res.status(200).json(user);
        }
        return res.status(404).json({error:"Invalid Credentials"});

    } catch (error) {
        res.status(500).json({error: "Error"})
    }

})

// JWT Required for the below endpoint
router.post('/welcome', auth, (req, res) => {
    res.status(200).json({"Sucess": "Welcome to the home page"})
})


module.exports = router