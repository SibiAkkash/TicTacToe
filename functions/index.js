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

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/create-player/:name', async (req, res) => {
    let name = req.params.name;
    let player = await playerRef.add({ name });
    console.log(name, player.id);
    res.json({ 'playerID': player.id });
    // res.send(player.id);
});

async function isValidPid(req, res, next) {
    const player = await playerRef.doc(req.params.pid).get();
    if(player.exists) {
        return next();
    } else {
        next(new Error('PlayerID does not exist'));
    }
}

app.get('/create-game/:pid', isValidPid, async(req, res) => {
    let pid = req.params.pid;
    let game = await gameRef.add({
        p1_id: pid,
        p2_id: null,
		board: Array(9).fill(''),
        turn: pid,
		playing: false
    });
    await playerRef.doc(pid).set({ 'gameID': gameID }, { merge: true });
    res.json({ 'gameID': game.id });
});

exports.api = functions.https.onRequest(app);

