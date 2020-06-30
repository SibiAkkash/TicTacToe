const express = require('express');
const router = express.Router();


router.use('/create-player', require('./createPlayer'));
router.use('/create-game', require('./createGame'));
router.use('/join-game', require('./joinGame'));
router.use('/move', require('./makeMove'));

// 404 error handler for invalid player and game IDs
router.use((err, req, res, next) => {
	res.json({ error: err.msg });
});


module.exports = router;
