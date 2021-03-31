// jshint esversion:6


const express = require('express');
const ejs = require("ejs");


const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

const port = 3000;

app.get('/', (req, res) => {
  res.render('index', {});
});

app.listen(port, () => {
  console.log('App listening at http://localhost:${port}');
});
