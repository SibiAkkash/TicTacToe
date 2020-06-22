const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express(); 
admin.initializeApp();

const db = admin.firestore();
const playerRef = db.collection('players');
const gameRef = db.collection('games');
const commandRef = db.collection('commands');

app.use(cors());
app.use(express.json());

app.get('/create-player/:name', async (req, res) => {
    let name = req.params.name;
    let player = await playerRef.add({ 
        name,
        msg: "", 
    });
    console.log(name, player.id);
    res.json({ 'playerID': player.id });
});

async function isValidPlayer(req, res, next) {
    const player = await playerRef.doc(req.params.pid).get();
    if(player.exists) {
        return next();
    } else {
        next(new Error('Player does not exist. Check the player ID'));
    }
}

async function isValidGame(req, res, next) {
    const game = await gameRef.doc(req.params.gid).get();
    if(game.exists && game.data().p2_id == null) {
        return next();
    } else {
        next(new Error('Game does not exist. Check the game ID !'));
    }
}

app.get('/create-game/:pid', isValidPlayer, async(req, res) => {
    let pid = req.params.pid;
    let game = await gameRef.add({
        p1_id: pid,
        p2_id: null,
		board: Array(9).fill(''),
        turn: pid,
        playing: false,
        outcome: null   //tie, gameover, forfeit
    });
    await playerRef.doc(pid).set({ 'gameID': game.id }, { merge: true });
    res.json({ 'gameID': game.id });
});

app.get('/join-game/:gid/player/:pid', isValidPlayer, isValidGame, async(req, res) => {
    let pid = req.params.pid;
    let gid = req.params.gid;
    
    await gameRef.doc(gid).update({
        p2_id: pid
    });
    await playerRef.doc(pid).set(
        { 'gameID': gid },
        { merge: true }
    );
    res.json({ 'gameID': gid });
})

exports.api = functions.https.onRequest(app);

