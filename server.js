const express = require("express")
const session = require('express-session');
const enableWs = require('express-ws')
const Sockets = require("./sockets/socketRoutes");
const path = require("path")
const MySQLStore = require('connect-mysql')(session)
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.js')[env];

// needed for .env file
require('dotenv').config()

const app = express();
// enables the web sockets for express
const wss = enableWs(app)

// stores the root path in a global variable
global.rootPath = path.resolve(__dirname);
const PORT = process.env.PORT || 3000;

let dbConfig;
if (config.use_env_variable) {
    dbConfig = process.env[config.use_env_variable]
} else {
    dbConfig = {
        user: process.env.DBUser,
        password: process.env.DBPassword,
        database: process.env.DB
    };
}

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        expires: 1000 * 60 * 60 * 24 * 3
    },
    store: new MySQLStore({
        config: dbConfig
    })
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'pug')
app.set('views', './views')

// Routes
app.use(express.static("./public"));

require("./routes/routes")(app, new Sockets(app));

// Starts the server to begin listening
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});