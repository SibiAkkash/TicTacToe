const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

async function isValidPlayer(req, res, next) {
	const player = await playerRef.doc(req.params.pid).get();
	if (player.exists) {
        return next();
	} else {
        res.status(404); 
		return next(new Error('player does not exist'));
	}
}

async function isValidGame(req, res, next) {
	const game = await gameRef.doc(req.params.gid).get();
	if (game.exists && game.data().p2_id == null) {
		return next();
	} else {
        res.status(404); 
		next(new Error("Game does not exist. Check the game ID !"));
	}
}

router.get("/create-player/:name", async (req, res) => {
	let name = req.params.name;
	let player = await playerRef.add({
		name,
        msg: null,
        gameID: null,
        char: null
	});
	console.log(name, player.id);
	res.json({
		playerID: player.id,
	});
});

router.get("/create-game/:pid", isValidPlayer, async (req, res) => {
	let pid = req.params.pid;
	// write a game object
	let game = await gameRef.add({
		p1_id: pid,
		p2_id: null,
		board: Array(9).fill(''),
		turn: pid,
		gameover: false,
		outcome: null, //tie, gameover, forfeit
	});
	// set turn msgs and player characters
	await playerRef.doc(pid).set(
		{
			gameID: game.id,
            char: "X",
            msg: "Your turn"
		},
		{ merge: true }
	);

	res.json({ gameID: game.id });
});

router.get(
	"/join-game/:gid/player/:pid",
	isValidPlayer,
	isValidGame,
	async (req, res) => {
		let pid = req.params.pid;
		let gid = req.params.gid;

		await gameRef.doc(gid).update({ p2_id: pid });

		await playerRef.doc(pid).set(
			{
				gameID: gid,
                char: "O",
                msg: "Opponent turn"
			},
			{ merge: true }
		);

		res.json({ gameID: gid });
	}
);

router.use(function(err, req, res, next) {
    res.json({ 'error': err.msg });
});


module.exports = router;