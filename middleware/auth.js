const jwt = require("jsonwebtoken")

require("dotenv").config()

const verifyToken = async(req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token) {
        return res.status(401).json({"error": "A token is required for authentication"})
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded
    } catch (error) {
        return res.status(401).send({"error": "Invalid Token"});
    }
    return next()
};

module.exports = verifyToken