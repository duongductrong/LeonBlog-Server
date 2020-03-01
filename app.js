/*
    ---------------------------------------------------------
                            Detail author
    Server name: BlogAPIServer
    Creater: Dương Đức Trọng
    Info: https://www.facebook.com/trong.duong.77398
    github: github.com/trong06

    ---------------------------------------------------------

                ****************************
    The create something project was be to express knowledge
                ****************************
*/
const express =  require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

/* Cors setting for browser chrome */
app.use(cors())

/* config */
dotenv.config();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* Database */
mongoose.connect(process.env.DTB_MONGODB_LOCAL, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log("Connection database completed")
});
/* use routes */
const userRoute = require("./api/routes/User.route");
const categoryRoute = require("./api/routes/Category.route");
const blogRoute = require("./api/routes/Blog.route");
const commentRoute = require("./api/routes/Comment.route");
const contactRoute = require("./api/routes/Contact.route");
//Menu routes
const menuRoute = require("./api/routes/Menu.route");
//System
const uploadsRoute = require("./api/routes/Upload.route");

app.use("/api/users/", userRoute);
app.use("/api/categories/", categoryRoute);
app.use("/api/blog/", blogRoute);
app.use("/api/comments/", commentRoute);
app.use("/api/contacts/", contactRoute);

app.use("/api/uploads", uploadsRoute);
app.use("/api/menu", menuRoute);

/* server running */
app.listen(process.env.PORT, () => {
    console.log("Server running");
})