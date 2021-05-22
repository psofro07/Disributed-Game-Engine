const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

require("dotenv").config();

const sequelize = require('./util/sql_database');

const User = require('./models/user');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(bodyParser.json());                              // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api/user', authRoutes);
app.use('/api', adminRoutes);

const port = 4000;

//error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

sequelize
  .sync()
  .then( result => {
      app.listen(port, () => {
          console.log('Server up and running at http://localhost:4000')
      })
  })
  .then(result => {
      return User.findOne({where: {username: 'Pipis'}});
      // console.log(result);
    })
  .then(user => {
      if (!user) {
        bcrypt
        .hash('yolo', 12)
        .then(hashedPass => {
          return User.create({ username: 'Pipis', email: 'pipis@test.com', password: hashedPass, role: 'Admin' });
        })
        
      }
      return user;
    })
  .catch(err => {
      console.log(err);
  });