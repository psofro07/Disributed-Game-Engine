// jshint esversion:6

const express = require('express');
const ejs = require("ejs");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const homeRoutes = require('./routes/home');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());

app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

const port = 3000;

app.use(loginRoutes);
app.use(homeRoutes);
app.use(registerRoutes);

// app.use('/', (req, res) => {
//   res.redirect('/login');
// })


app.listen(port, () => {
  console.log('App listening at http://localhost:3000');
});
