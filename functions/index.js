const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

const express = require("express");
const cors = require("cors");

const app = express();

const indexRouter = require("./api/indexRouter");

const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

app.use(cors());
app.use(express.json());

app.use("/", indexRouter);

function boardAfterMove(board, char) {
	const wins = [
		//rows
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		//cols
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		//diags
		[0, 4, 8],
		[2, 4, 6],
	];
    
    for(let combination of wins) {
        let cells = [];
        combination.forEach(index => cells.push(board[index]));
        if (cells.every(cell => cell == char)) {
			return {
				outcome: "win",
				winCombination: combination,
			};
		}
    }

	let emptyCells = board.reduce((acc, curr) => acc + (curr == "" ? 1 : 0), 0);
	if (emptyCells == 0) {
		return {
			outcome: "tie",
			winCombination: [],
		};
	} else {
		return { outcome: "nextMove" };
	}
}

async function updateBoard(game, player, cellNo) {
	let board = game.data().board;
	let p1 = game.data().p1_id;
	let p2 = game.data().p2_id;
	let char = player.data().char;

	if (cellNo < 0 || cellNo > 8) {
		console.log("cell out of bounds");
		// throw error
		await playerRef.doc(player.id).update({ msg: "Out of bounds" });
		return;
	}
	if (board[cellNo]) {
		console.log("cell already taken");
		// throw error
		await playerRef.doc(player.id).update({ msg: "cell taken" });
		return;
	}

	console.log("valid move");
	board[cellNo] = char;
	console.log(board);

	await gameRef.doc(game.id).update({ board });

	let outcome = boardAfterMove(board, char).outcome;
	//* outcome -> win, next-player-turn, tie

	switch (outcome) {
		case "win":
			await gameRef.doc(game.id).update({ gameover: true });
			//set player msg
			let opponent = player.id == p1 ? p2 : p1;
			await playerRef.doc(player.id).update({ msg: "You win" });
			await playerRef.doc(opponent).update({ msg: "Your lose" });
			// set winner id in game doc
			break;

		case "tie":
			await gameRef.doc(game.id).update({ gameover: true });
			//set player msg
			await playerRef.doc(p1).update({ msg: "Draw" });
			await playerRef.doc(p2).update({ msg: "Draw" });
			break;

		case "nextMove":
			// toggle turn
			let turn = p1 == game.data().turn ? p2 : p1;
			await gameRef.doc(game.id).update({ turn });
			await playerRef.doc(player.id).update({ msg: "Opponent turn" });
			await playerRef.doc(turn).update({ msg: "Your turn" });
			break;
	}
}

async function handleMove(gameID, playerID, cellNo) {
	let game = await gameRef.doc(gameID).get();
	let player = await playerRef.doc(playerID).get();

	if (game.exists) {
		if (game.data().turn == playerID) {
			updateBoard(game, player, cellNo);
		} else {
			await playerRef.doc(player.id).update({ msg: "Its not your turn" });
		}
	} else {
		console.log("game doesn't exist");
	}
}

exports.onNewCommand = functions.firestore
	.document("commands/{cmd_id}")
	.onCreate((snap, context) => {
		const cmd = snap.data();
		switch (cmd.type) {
			case "move":
				handleMove(cmd.gameID, cmd.playerID, cmd.cellNo);
				break;
		}
	});

exports.api = functions.https.onRequest(app);
