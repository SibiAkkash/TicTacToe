const admin = require('firebase-admin');

const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

const getUpdatedBoard = require('./getUpdatedBoard');

function updatePlayerMessages(values) {
	const {p1, p2, p1msg, p2msg} = values;
	let updateP1 = playerRef.doc(p1).update({ msg: p1msg });
	let updateP2 = playerRef.doc(p2).update({ msg: p2msg });
	return Promise.all([updateP1, updateP2]);
}

module.exports = async function updateBoard(game, player, cellNo) {
	let {board, p1, p2} = game.data();

	if (cellNo < 0 || cellNo > 8) {
		await playerRef.doc(player.id).update({ msg: "Out of bounds" });
	}
	if (board[cellNo]) {
		await playerRef.doc(player.id).update({ msg: "cell taken" });
	}

	board[cellNo] = player.data().char;
	let outcome = getUpdatedBoard(board, player.data().char).outcome;
	
	await gameRef.doc(game.id).update({ board });

	let msgData = {};

	switch (outcome) {
		case "win":
			await gameRef.doc(game.id).update({ gameover: true });

			let opponent = player.id == p1 ? p2 : p1;
			msgData = {
				p1: player.id,
				p2: opponent,
				p1msg: "You win",
				p2msg: "You lose"
			};

			break;

		case "tie":
			await gameRef.doc(game.id).update({ gameover: true });
			msgData = {
				p1,
				p2,
				p1msg: "Draw",
				p2msg: "Draw"
			};

			break;

		case "nextMove":
			// toggle turn
			let turn = p1 == game.data().turn ? p2 : p1;
			await gameRef.doc(game.id).update({ turn });
			msgData = {
				p1: player.id,
				p2: turn,
				p1msg: "Opponent turn",
				p2msg: "Your turn"
			};

			break;
	};
	await updatePlayerMessages(msgData);
}

