// Game.model.js

const mongoose = require("mongoose");


const gameMoveSchema = new mongoose.Schema({
    gameID: {
        type: String,
        required: true,
    },
    turn: {
        type: Boolean,
        required: true,
    },
    move: {
        source: {
            type: String,
            default: null
        },
        target: {
            type: String,
            default: null
        } 
    },
    move_by: {
        type: String,
        default: null
    },
    status: {
        state: {
            type: String,
            enum: ['playing', 'checkmate', 'tie'],
            default: 'playing',
            required: true
        },
        winner: {
            type: String,
            default: null
        }
    },

});


const GameMove = mongoose.model("Game", gameMoveSchema);

module.exports = GameMove;