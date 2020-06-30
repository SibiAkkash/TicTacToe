const express = require('express');
const router = express.Router();

const isValidPlayer = require('../middlewares/isValidPlayer');
const isValidGame = require('../middlewares/isValidGame');

const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

router.post("/:gid", isValidPlayer, isValidGame, async (req, res) => {
	let pid = req.body.playerID;
	let gid = req.params.gid;

	await gameRef.doc(gid).update({ p2_id: pid });

	await playerRef.doc(pid).update({
		gameID: gid,
		char: "O",
		msg: "Opponent turn",
	});

	res.json({ gameID: gid });
});

module.exports = router;