const Sequelize = require('sequelize');

const sequelize = require('../connection');

const tournament = sequelize.define('TournamentHistory', {
    tournID: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "My first tournament",
        required: true
    },
    official: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    playersJoined: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.DataTypes.ENUM('full', 'joinable', "in progress", 'finished'),
        defaultValue: 'joinable'
    },
    type: {
        type: Sequelize.DataTypes.ENUM('chess', 'tic-tac-toe'),
        allowNull: false,
        required: true
    }
})

module.exports = tournament;