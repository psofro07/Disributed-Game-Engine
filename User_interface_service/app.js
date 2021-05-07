// jshint esversion:6

const express = require('express');
const ejs = require("ejs");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

const gameRoutes = require('./routes/game');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const homeRoutes = require('./routes/home');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
app.use(session({secret: 'somehting', resave: false, saveUninitialized: false}));

app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

const port = 3000;

app.use(gameRoutes);
app.use(loginRoutes);
app.use(logoutRoutes);
app.use(homeRoutes);
app.use(registerRoutes);

// unchecked
app.get('/', (req, res) => {
  res.redirect('/login');
})


app.listen(port, () => {
  console.log('App listening at http://localhost:3000');
});
