const express = require('express');
const router = express.Router();

// const isValidPlayer = require('../middlewares/isValidPlayer');
const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");


router.post('/', async (req, res) => {
	let name = req.body.name;
	console.log('name', req.body);
	let player = await playerRef.add({
		name,
		msg: null,
		gameID: null,
		char: null,
	});
	res.json({ playerID: player.id });
});

module.exports = router;