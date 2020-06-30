const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

module.exports = async function isValidPlayer(req, res, next) {
	const player = await playerRef.doc(req.body.playerID).get();
	if (player.exists) {
		return next();
	} else {
		res.status(404);
		return next(new Error("player does not exist"));
	}
}