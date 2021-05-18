const Sequelize = require('sequelize');

const sequelize = require('../connection');

const tournament = sequelize.define('Tournament', {
    tournID: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    player1: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "empty",
        required: true
    },
    player2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "tasos",
        required: true
    },
    player3: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "sifis",
        required: true
    },
    player4: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "pipis",
        required: true
    },
    player5: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "kostas",
        required: true
    },
    player6: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "giannis",
        required: true
    },
    player7: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "nikos",
        required: true
    },
    player8: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "empty",
        required: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "My first tournament",
        required: true
    },
    full: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    type: {
        type: Sequelize.DataTypes.ENUM('chess', 'tic-tac-toe'),
        allowNull: false,
        required: true
    }
})

module.exports = tournament;