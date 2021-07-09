const Sequelize = require('sequelize');

const sequelize = require('../util/sql_database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    role: {
        type: Sequelize.DataTypes.ENUM('Player', 'Official', 'Admin'),
        defaultValue: 'Player',
        allowNull: false,
        required: true
    }
})

module.exports = User;