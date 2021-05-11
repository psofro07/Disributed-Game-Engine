const Sequelize = require('sequelize');

const sequelize = require('../connection');

const player = sequelize.define('PlayersList', {
    username: {
        type: Sequelize.STRING,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: Sequelize.DataTypes.ENUM('searching', 'in game'),
        default: 'searching'
    }

})

module.exports = player;