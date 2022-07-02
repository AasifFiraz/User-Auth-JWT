const express = require("express")
const User = require("../model/user")
const crypto = require ("crypto");
const jwt = require("jsonwebtoken")
const errorHandler = require("../middleware/error-handler")
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
        // Get User Input
        const {username, email, password} = req.body

        // Validate User Input
        if (!(email && password && username)) {
            throw new errorHandler("All Input is Required", 400)
        }

        // Check if user already exists
        const isExistingUser = await User.findOne({ email })
        if(isExistingUser){
            throw new errorHandler("Email already exists. Please Login", 409) 
        }

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: encryptPassword(password), // Encrypt User Password 
        })
        // Return new user
        res.status(200).json(user)
});

router.post('/login', async(req, res) => {     
    try {        
        const {email, password} = req.body

        if (!(email && password)) {
            throw new errorHandler("All Input is Required", 400)
        }

        const user = await User.findOne({ email });
        const {iv, content} = user.password

        if (user.email && decryptPassword(iv, content) === password) {
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
        throw Error()
    } catch (error) {
        throw new errorHandler("Invalid Credentials", 404)        
    }   
})

// JWT Required for the below endpoint
router.post('/welcome', auth, (req, res) => {
    res.status(200).json({"Sucess": "Welcome to the home page"})
})



module.exports = router