const express = require('express');
const ejs = require("ejs");
const bodyParser = require('body-parser');


const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

const port = 4000;

app.listen(port, () => {
    console.log('Server up and running at http://localhost:4000')
})
