const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require("dotenv").config();

const sequelize = require('./util/sql_database');

const User = require('./models/user');

const authRoutes = require('./routes/auth');
const homeRoute = require('./routes/home');


app.use(bodyParser.json());                            // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

app.use(authRoutes);
app.use(homeRoute);

const port = 4000;

sequelize
    .sync()
    .then( result => {
        app.listen(port, () => {
<<<<<<< HEAD
            console.log('Server up and pipes at http://localhost:4000')
=======
            console.log('Server up and running at http://localhost:4000')
>>>>>>> d3b2714932f8dd8bd2be6f5bd5be9a6846a4ad3d
        })
    })
    .then(result => {
        return User.findByPk(1);
        // console.log(result);
      })
    .then(user => {
        if (!user) {
          return User.create({ username: 'Pipis', email: 'pipis@test.com', password: 'yolo' });
        }
        return user;
      })
    .catch(err => {
        console.log(err);
    });