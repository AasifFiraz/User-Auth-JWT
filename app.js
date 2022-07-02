const express = require("express")
require("express-async-errors");
const connectDB = require("./config/database")
const user = require("./routes/user")
const app = express()
require("dotenv").config()

app.use(express.json())
app.use('/user', user)


const errorHandling = (err, req, res, next) => {
    res.status(err.statusCode).json({
      msg: err.message,
      status: false,
    });
};
app.use(errorHandling)

PORT = 5000 || process.env.PORT

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`running on port ${PORT}...`);
        })
    } catch (error) {
        console.log(error);
    }
}

start()