// User.model.js

const mongoose = require("mongoose");


const gameSchema = new mongoose.Schema({
    gameID: {
        type: String,
        required: true,
    },
    player1: {
        type: String,
        required: true,
    },
    player2: {
        type: String,
        required: false,
        default: null
    },
    type: {
        type: String,
        enum: ['chess', 'tic-tac-toe'],
        required: true,
    }
});


const Game = mongoose.model("Game", gameSchema);

module.exports = Game;