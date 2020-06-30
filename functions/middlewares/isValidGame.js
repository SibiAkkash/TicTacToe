const admin = require("firebase-admin");
const db = admin.firestore();
const playerRef = db.collection("players");
const gameRef = db.collection("games");

module.exports =  async function isValidGame(req, res, next) {
	const game = await gameRef.doc(req.params.gid).get();
	if (game.exists && game.data().p2_id == null) {
		return next();
	} else {
		res.status(404);
		next(new Error("Game does not exist. Check the game ID !"));
	}
}

