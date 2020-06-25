const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

async function isValidPlayer(req, res, next) {
	const player = await playerRef.doc(req.params.pid).get();
	if (player.exists) {
		return next();
	} else {
		next(new Error("Player does not exist. Check the player ID"));
	}
}

async function isValidGame(req, res, next) {
	const game = await gameRef.doc(req.params.gid).get();
	if (game.exists && game.data().p2_id == null) {
		return next();
	} else {
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
    let board = [];
    for(let i = 0; i < 3; i++) {
        board.push(Array(3).fill(''));
    }
	let game = await gameRef.add({
		p1_id: pid,
		p2_id: null,
		board,
		turn: pid,
		gameover: false,
		outcome: null, //tie, gameover, forfeit
	});
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

		await gameRef.doc(gid).update({
			p2_id: pid,
		});

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
