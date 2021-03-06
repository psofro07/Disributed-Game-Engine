const Sequelize = require('sequelize');

const sequelize = require('../connection');

const game = sequelize.define('GameList', {
    gameID: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    player1: {
        type: Sequelize.STRING,
        allowNull: true,
        required: true
    },
    player2: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null,
        required: true
    },
    player1Score: {
        type: Sequelize.FLOAT,
        allowNull: false,
        default: 0,
        required: true
    },
    player2Score: {
        type: Sequelize.FLOAT,
        allowNull: false,
        default: 0,
        required: true
    },
    game: {
        type: Sequelize.DataTypes.ENUM('chess', 'tic-tac-toe'),
        allowNull: false,
        required: true
    },
    type: {
        type: Sequelize.DataTypes.ENUM('practice', 'tournament'),
        allowNull: false,
        required: true
    },
    tournID: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
    },
    round: {
        type: Sequelize.DataTypes.ENUM('normal', 'final', 'semifinal'),
        defaultValue: 'normal'
    }
})

module.exports = game;