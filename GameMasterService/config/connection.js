
const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres://user:pass@postgres-gamemaster:5432/sql-gm', {logging: false});

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.USERNAME, process.env.PASSWORD, {
//   host: process.env.HOST,
//   dialect: 'postgres'
// });

module.exports = sequelize;
