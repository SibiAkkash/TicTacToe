const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// const indexRouter = require('./api/indexRouter');

const app = express(); 
admin.initializeApp();

const db = admin.firestore();
const playerRef = db.collection('players');
const gameRef = db.collection('games');

app.use(cors());
app.use(express.json());

app.use('/', indexRouter);


function boardAfterMove(board, char) {
    let win = false;
    let emptyCells = 0;
    //rows
    for(let i = 0; i < 3; i++) {
        if(board[i].every(cell => cell == char)) {
            win = true;
            break
        }
    }
    //columns
    for(let i = 0; i < 3; i++) {
        let a = board[0][i];
        let b = board[1][i];
        let c = board[2][i];
        if([a,b,c].every(cell => cell == char)) {
            win = true;
            break;
        }
    }   
    //diagonals
    for(let i=0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            emptyCells += board[i][j] ? 0 : 1;
            if(i == j) {

            }
        }
    }
    
    let outcome;
    if(win) {
        outcome = 'win';
    } else if(emptyCells == 0) {
        outcome = 'draw';
    } else {
        outcome = 'nextMove';
    }

    return outcome;
}

async function updateBoard(game, player, x, y) {
    let board = game.data().board;
    let p1 = game.data().p1_id;
    let p2 = game.data().p2_id;
    console.log(player.data());
    let char = player.data().char;
    
    if(x < 0 || x > 2 || y < 0 || y > 2) {
        console.log('cell out of bounds');
        // throw error
        await playerRef.doc(player.id).update({ msg: 'Out of bounds' });
        return;
    }  
    if(board[x][y]) {
        console.log('cell already taken');
        // throw error
        await playerRef.doc(player.id).update({ msg: 'cell taken' });
        return;
    }
    
    board[cell] = char;
    
    await gameRef.doc(game.id).update({ board });

    let outcome = boardAfterMove(board, char); 
    //* outcome -> win, next-player-turn, tie

    switch(outcome) {
        case 'win':
            await gameRef.doc(game.id).update({ gameover: true }); 
            //set player msg
            let opponent = player.id == p1 ? p2 : p1;
            await playerRef.doc(player.id).update({ msg: 'You win' });
            await playerRef.doc(opponent).update({ msg: 'Your lose' });
            // set winner id in game doc
            break;

        case 'tie':
            await gameRef.doc(game.id).update({ gameover: true }); 
            //set player msg
            await playerRef.doc(p1).update({ msg: 'Draw' });
            await playerRef.doc(p2).update({ msg: 'Draw' });
            break;

        case 'nextMove':
            // toggle turn   
            let turn = p1 == game.data().turn ? p2 : p1;
            await gameRef.doc(game.id).update({ turn });  
            await playerRef.doc(player.id).update({msg: 'Opponent turn'});
            await playerRef.doc(turn).update({ msg: 'Your turn' });
            break;
    }
}

async function handleMove(gameID, playerID, x, y) {
    let game = await gameRef.doc(gameID).get();
    let player = await playerRef.doc(playerID).get();

    if(game.exists) {
        if(game.data().turn == playerID) {
            updateBoard(game, player, x, y);
        } else {
            await playerRef.doc(player.id).update({ 
                msg: 'Its not your turn' 
            });
        }
    } else {
        console.log("game doesn't exist");
    }
}

exports.onNewCommand = functions.firestore
    .document('commands/{cmd_id}')
    .onCreate((snap, context) => {
        const cmd = snap.data();
        switch(cmd.type) {
            case 'move': 
                handleMove(cmd.gameID, cmd.playerID, cmd.x, cmd.y);
        }
    });

exports.api = functions.https.onRequest(app);

