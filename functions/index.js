const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const indexRouter = require('./api/indexRouter');

const app = express(); 
admin.initializeApp();

const db = admin.firestore();
const playerRef = db.collection('players');
const gameRef = db.collection('games');
const commandRef = db.collection('commands');

app.use(cors());
app.use(express.json());

app.use('/', indexRouter);

function boardAfterMove(board, char) {
    let win = false;
    let emptyCells = 0;
    
}

function updateBoard(gameID, board, playerChar, x, y) {

    if(x < 0 || x > 2 || y < 0 || y > 2) {
        console.log('cell out of bounds');
        // throw error
    }  
    if(board[x][y]) {
        console.log('cell already taken');
        // throw error
    }
    
    newBoard[cell] = playerChar;
    await gameRef.doc(gameID).update({
        board: newBoard
    });

    let outcome = boardAfterMove(board, playChar); 
    //* outcome -> win, next-player-turn, tie
    //* push respective msgs to player collection

}

function handleMove(gameID, playerID, x, y) {
    let game = await gameRef.doc(gameID).get();
    let player = await gameRef.doc(playerID).get();

    if(game.exists) {
        if(game.data().turn == playerID) {
            let board = game.data().board;
            updateBoard(gameID, board, player.char, x, y);
        } else {
            console.log('its not your turn !');
        }
    } else {
        console.log('game doesnt exist');
    }
}

exports.onNewCommand = functions.firestore
    .document('commands/{cmd_id}')
    .onCreate((snap, context) => {
        const cmd = snap.data();
        switch(cmd.type) {
            case 'move': handleMove(cmd.game_id, cmd.player_id, cmd.x, cmd.y);
        }
    });

exports.api = functions.https.onRequest(app);

