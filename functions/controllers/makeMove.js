const express = require('express');
const router = express.Router();

const isValidPlayer = require('../middlewares/isValidPlayer');
const isValidGame = require('../middlewares/isValidGame');

const getUpdatedBoard = require('../helpers/getUpdatedBoard');
const updateBoard = require('../helpers/updateBoard');

const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

router.post('/', isValidGame, isValidPlayer, async (req, res) => {
	console.log(req.body);
	const {gameID, playerID, cellNo} = req.body;

	let [game, player] = await Promise.all([
		gameRef.doc(gameID).get(),
		playerRef.doc(playerID).get()
	]);

	if (game.exists) {
		if (game.data().turn == playerID) {
			await updateBoard(game, player, cellNo);
		} else {
			await playerRef.doc(player.id).update({ msg: "Its not your turn" });
		}
	} else {
		console.log("game doesn't exist");
		res.status(404).send('game does not exist');
	}
	res.json({msg: 'move done'});
});

module.exports = router;