var express = require("express");
//var config = require("config");
var cookieParser = require("cookie-parser");
//var logger = require('morgan');
var session = require("express-session");
var socketio = require("socket.io");
var app = express();
require('dotenv').config();
const SECRET_KEY= 'secretkey';
// const rateLimit = require("express-rate-limit");
// const limiter = rateLimit ({
//     windowMs: 30*60*1000,
//     max: 15,
//     message: "Máy móc cũng mòn, nên đợi xíu hãy Dos tiếp, con gà!!! :))"
// }); //giới hạn IP truy cập không quá 5 lần / 30p
//body-parser
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
// app.use(logger('dev'));
app.use(cookieParser());
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
//static folder
app.use("/static", express.static(__dirname + "/public"));
//app.use(express.static(__dirname + "/static2"));
//app.use(morgan("dev"));
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.set("trust proxy", 1); //trust first proxy
//app.use(logger('combined'));
var controllers = require(__dirname + "/apps/controllers");
app.use(controllers);
//var host=process.env.HOST || 0.0.0.0;

var port = process.env.PORT || 8081;
//var server=app.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
var server = app.listen( port, function () {
  console.log("Server is running on port ", port);
});
var io = socketio(server);
var socketcontrol = require("./apps/common/socketcontrol")(io);

