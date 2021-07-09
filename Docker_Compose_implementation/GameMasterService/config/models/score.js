const Sequelize = require('sequelize');

const sequelize = require('../connection');

const score = sequelize.define('PlayerScores', {
    username: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    practiceScore: {
        type: Sequelize.FLOAT,
        autoIncrement: false,
        allowNull: false,
        defaultValue: 800
    },
    tournamentScore: {
        type: Sequelize.FLOAT,
        autoIncrement: false,
        allowNull: false,
        defaultValue: 800
    }

})

module.exports = score;