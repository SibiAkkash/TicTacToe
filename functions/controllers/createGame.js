const express = require('express');
const router = express.Router();

const isValidPlayer = require('../middlewares/isValidPlayer');

const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

router.post("/", isValidPlayer, async (req, res) => {
	let pid = req.body.playerID;
	// write a game object
	let game = await gameRef.add({
		p1_id: pid,
		p2_id: null,
		board: Array(9).fill(""),
		turn: pid,
		gameover: false,
		outcome: null, //tie, gameover, forfeit
	});
	// set turn msgs and player characters
	await playerRef.doc(pid).update({
		gameID: game.id,
		char: "X",
		msg: "Your turn",
	});

	res.json({ gameID: game.id });
});

module.exports = router;