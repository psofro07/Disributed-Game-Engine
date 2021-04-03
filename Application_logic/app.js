// jshint esversion:6


const express = require('express');
const ejs = require("ejs");
const bodyParser = require('body-parser');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

const port = 3000;



app.get('/', (req, res) => {
  res.render('index', {});
});

app.post('/home', (req, res) => {

  let email = req.body.userEmail;
  let psw = req.body.userPass;

  res.render('home', { email: email, psw: psw});
  
});

app.listen(port, () => {
  console.log('App listening at http://localhost:${port}');
});
