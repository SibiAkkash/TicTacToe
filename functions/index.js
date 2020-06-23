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

function checkWin(board, char) {
    let win = false;
    let emptyCells = 0;
    for(let i = 0; i < 9; i += 3) {
        if(board.splice(i, i+3).every(move => move == char)) {
            win = true;
            break;
        }
    }
}

function updateBoard(gameID, board, playerChar, cell) {
    if(cell < 0 && cell >= 9 && board[cell] != '') {
        console.log('cell already taken !');
    } else {
        newBoard[cell] = playerChar;
        await gameRef.doc(gameID).update({
            board: newBoard
        });
        checkWin(board, playChar); 
    }
}

function handleMove(gameID, playerID, cell) {
    let game = await gameRef.doc(gameID).get();
    let player = await gameRef.doc(playerID).get();

    if(game.exists) {
        if(game.data().turn == playerID) {
            let board = game.data().board;
            updateBoard(gameID, board, player.char, cell);
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
        const type = cmd.type;
        switch(type) {
            case 'move': handleMove(cmd.game_id, cmd.player_id, cell)
        }
    });

exports.api = functions.https.onRequest(app);

