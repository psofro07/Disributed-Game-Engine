// connection.js
const mongoose = require("mongoose");


module.exports = () => {
  mongoose.connect(`mongodb://${process.env.MONGO_HOST}:27017`, {
    dbName: `${process.env.MONGO_DB_NAME}`,
    user: `${process.env.MONGO_USERNAME}`,
    pass: `${process.env.MONGO_PASSWORD}`,
    useNewUrlParser: true,
    useUnifiedTopology: true

  }).then( () => {
    console.log('Mongodb connected...');
  })
  .catch(err => console.log(err.message));

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to db...');
  });

  mongoose.connection.on('error', err => {
    console.log(err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection is disconnected...');
  });


  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log(
        'Mongoose connection is disconnected due to app termination...'
      );
      process.exit(0);
    });
  });
 
};