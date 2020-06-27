class Game {
	constructor() {
		this.db = firebase.firestore();
		this.commandsRef = this.db.collection("commands");
		this.playerRef = this.db.collection("players");
		this.gameRef = this.db.collection("games");

		this.boardRef = document.getElementById("board");
		this.msgRef = document.getElementById("msg");
		this.joinGameInput = document.getElementById("joinGameID");
		this.createGameBtn = document.getElementById("createGameBtn");
		this.joinGameBtn = document.getElementById("joinGameBtn");

		this.api_prod =
			"https://us-central1-tictactoe-func.cloudfunctions.net/api";
		this.api_local = "http://localhost:5001/tictactoe-func/us-central1/api";
	}

	init() {
		this.makeBoard();
		this.getPlayerID();
		this.addListeners();
	}

	addListeners() {
		this.createGameBtn.addEventListener("click", () => this.createGame());
		this.joinGameBtn.addEventListener("click", () => this.joinGame());
	}

	attachGameListener() {
		this.detachGameListener = this.gameRef
			.doc(this.gameID)
			.onSnapshot((snap) => {
				console.log(snap);
				let updatedBoard = snap.data().board;
				console.log(snap.data().board);
				this.setBoard(updatedBoard);
			});
	}

	attachPlayerListener() {
		this.detachPlayerListener = this.playerRef
			.doc(this.playerID)
			.onSnapshot((snap) => {
				console.log(snap);
				console.log(snap.data());
				this.setMsg(snap.data().msg);
			});
	}

	setMsg(msg) {
		this.msgRef.textContent = msg;
	}

	makeBoard() {
		for (let i = 0; i < 9; i++) {
			let cell = document.createElement("div");
			cell.setAttribute("id", `cell-${i}`);
			cell.addEventListener("click", () => this.makeMove(i));
			this.boardRef.appendChild(cell);
		}
	}

	setBoard(board) {
		for (let i = 0; i < 9; i++) {
			document.getElementById(`cell-${i}`).textContent = board[i];
		}
	}

	async makeMove(cellNo) {
		let cmd_id = this.commandsRef.add({
			type: "move",
			gameID: this.gameID,
			playerID: this.playerID,
			cellNo
		});
	}

	async getPlayerID() {
		if (!this.playerID) {
			this.name = prompt("enter username pls");
			let response = await fetch(
				`${this.api_prod}/create-player/${this.name}`
			);
			response = await response.json();
			this.playerID = response.playerID;
		}
		this.attachPlayerListener();
	}

	async createGame() {
		if (this.playerID && !this.gameID) {
			let response = await fetch(
				`${this.api_prod}/create-game/${this.playerID}`
			);
			response = await response.json();
			this.gameID = response.gameID;
		}
		console.log(this.playerID, this.gameID);
		this.attachGameListener();
	}

	async joinGame() {
		let gameToJoin = this.joinGameInput.value;
		if (!gameToJoin) {
			alert("game id cannot be empty");
		} else {
			let response = await fetch(
				`${this.api_prod}/join-game/${gameToJoin}/player/${this.playerID}`
			);
			response = await response.json();
			this.gameID = response.gameID;
			console.log(this.playerID, this.gameID);
		}
	}

}

document.addEventListener("DOMContentLoaded", function () {
	let game = new Game();
	game.init();
});
