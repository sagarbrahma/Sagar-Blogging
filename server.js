const express = require("express");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();
const path = require("path");
const cookieParser = require('cookie-parser');
const moment = require('moment');
const session = require('express-session');
const flash = require("connect-flash");


app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.locals.moment = moment;
app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(flash());

app.use(session({
    secret: 'A3M4WTS',
    saveUninitialized: true,
    resave: true
}));

const dbDriver = "mongodb+srv://sagar:H7XaPyegLotjewpV@cluster0.zoyhx.mongodb.net/sagarblog";

const jwtAuth = require('./middlewares/authJwt');
app.use(jwtAuth.authJwt);

const jwt_Auth = require('./middlewares/userAuth');
app.use(jwt_Auth.userAuth);

const adminRouter = require("./routes/admin.routes");
app.use("/admin", adminRouter);

const userRouter = require('./routes/userBlog.routes');
app.use( userRouter);


const port = process.env.PORT || 9000;


mongoose.connect(dbDriver, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    app.listen(port, () => {
        console.log(`DB got connected!`);
        console.log(`Server is running on http://localhost:${port}`);
    })
}).catch(err => {
    console.log(err);
});