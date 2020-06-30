module.exports = function getUpdatedBoard(board, char) {
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
		const cellsToCheck = combination.map(index => board[index]);
        if (cellsToCheck.every(cell => cell == char)) {
			return {
				outcome: "win",
				winCombination: combination,
			};
		}
    }

	let emptyCells = board.reduce((acc, curr) => acc + (curr == "" ? 1 : 0), 0);
	if (emptyCells == 0) {
		return { outcome: "tie" };
	} 
	return { outcome: "nextMove" };
}