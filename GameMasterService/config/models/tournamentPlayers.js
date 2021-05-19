const Sequelize = require('sequelize');

const sequelize = require('../connection');

const tPlayers = sequelize.define('TournamentPlayer', {
    username: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    tournID: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    round: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1, 
    },
    status: {
        type: Sequelize.DataTypes.ENUM('won', 'lost', 'in game', 'in lobby'),
        defaultValue: 'in lobby'
    }

})

module.exports = tPlayers;