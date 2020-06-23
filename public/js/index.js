// const { runInThisContext } = require("vm");

class Game {
	constructor() {
		this.board = Array(9).fill("");
		this.canStartListening = false;
		this.isMyTurn = false;

		this.db = firebase.firestore();
		this.commandsRef = this.db.collection("commands");
		this.playerRef = this.db.collection("players");
		this.gameRef = this.db.collection("players");

		this.boardRef = document.getElementById("board");
		this.joinGameInput = document.getElementById("joinGameID");
		this.createGameBtn = document.getElementById("createGameBtn");
		this.joinGameBtn = document.getElementById("joinGameBtn");

		this.baseURL =
			"https://us-central1-tictactoe-func.cloudfunctions.net/api";
		// this.baseURL = 'http://localhost:5001/tictactoe-func/us-central1/api';
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

	startListening() {
		let stopListening = () => {
			this.gameRef.doc(this.gameID).onSnapshot((snap) => {
				let updatedBoard = snap.data().board;
				console.log(snap.data().board);
				this.setBoard(updatedBoard);
			});
		};

		let unsubPlayer = () => {
			this.playerRef.doc(this.playerID).onSnapshot((snap) => {
				this.setMsg(snap.data().msg);
			});
		};

		stopListening();
		unsubPlayer();
	}

	makeBoard() {
		for (let i = 0; i < 3; i++) {
			for (let j = 0; i < 3; j++) {
				let cell = document.createElement("div");
				cell.setAttribute("id", `cell-${i}-${j}`);
				cell.addEventListener('click', () => this.makeMove(i,j));
				this.boardRef.appendChild(cell);
			}
		}
	}

	setBoard(board) {
		for (let i = 0; i < 9; i++) {
			document.getElementById(`cell-${i}`).textContent = board[i];
		}
	}

	async getPlayerID() {
		if (!this.playerID) {
			this.name = prompt("enter username pls");
			let response = await fetch(
				`${this.baseURL}/create-player/${this.name}`
			);
			response = await response.json();
			this.playerID = response.playerID;
		}
	}

	async createGame() {
		if (this.playerID && !this.gameID) {
			let response = await fetch(
				`${this.baseURL}/create-game/${this.playerID}`
			);
			response = await response.json();
			this.gameID = response.gameID;
		}
		console.log(this.playerID, this.gameID);
		this.canStartListening = true;
		this.startListening();
	}

	async joinGame() {
		let gameToJoin = this.joinGameInput.value;
		if (!gameToJoin) {
			alert("game id cannot be empty");
		} else {
			let response = await fetch(
				`${this.baseURL}/join-game/${gameToJoin}/player/${this.playerID}`
			);
			response = await response.json();
			this.gameID = response.gameID;
			console.log(this.playerID, this.gameID);
		}
		this.canStartListening = true;
		this.startListening();
	}

	async makeMove(cell, x, y) {
		let cmd = this.commandsRef.add({
			type: "move",
			gameID: this.gameID,
			playerID: this.playerID,
            x, 
            y
		});
	}
}

window.onload = () => {
	let game = new Game();
	game.init();
};
