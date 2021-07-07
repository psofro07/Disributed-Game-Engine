
const Sequelize = require('sequelize');

const sequelize = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB_NAME}`, {logging: false});
//const sequelize = new Sequelize('postgres://user:pass@postgres-gamemaster:5432/sql-gm', {logging: false});

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.USERNAME, process.env.PASSWORD, {
//   host: process.env.HOST,
//   dialect: 'postgres'
// });

module.exports = sequelize;
