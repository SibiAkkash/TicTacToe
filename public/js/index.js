class Game {
	constructor() {
		this.db = firebase.firestore();
		this.commandsRef = this.db.collection("commands");
		this.playerRef = this.db.collection("players");
		this.gameRef = this.db.collection("games");
		this.gameIDRef = document.getElementById("gameID");

		this.boardRef = document.getElementById("board");
		this.msgRef = document.getElementById("msg");
		this.joinGameInput = document.getElementById("joinGameID");
		this.createGameBtn = document.getElementById("createGameBtn");
		this.joinGameBtn = document.getElementById("joinGameBtn");

		this.api_prod =
			"https://us-central1-tictactoe-func.cloudfunctions.net/apiv2";
		this.api_local = "http://localhost:5001/tictactoe-func/us-central1/api";
		this.env = "prod";
	}

	init() {
		this.makeBoard();
		this.getPlayerID();
		this.addListeners();
	}

	addListeners() {
		this.createGameBtn.addEventListener("click", () => this.createGame());
		this.joinGameBtn.addEventListener("click", () => this.joinGame());
		document.getElementById('testMoveEndpoint').addEventListener('click', () => this.makeMove(2));
	}

	attachGameListener() {
		this.detachGameListener = this.gameRef
			.doc(this.gameID)
			.onSnapshot((snap) => {
				let updatedBoard = snap.data().board;
				this.setBoard(updatedBoard);
			});
	}

	attachPlayerListener() {
		this.detachPlayerListener = this.playerRef
			.doc(this.playerID)
			.onSnapshot((snap) => {
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
		let url = this.env == "local" ? this.api_local : this.api_prod;

		let data = {
			gameID: this.gameID,
			playerID: this.playerID,
			cellNo
		};
		
		await fetch(`${url}/move`, {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(data),
		});
		
	}

	async getPlayerID() {
		//dev or prod api
		let url = this.env == "local" ? this.api_local : this.api_prod;
		if (!this.playerID) {
			this.name = prompt("enter username pls");
			let data = { name: this.name };

			let response = await fetch(`${url}/create-player`, {
				method: "POST",
				cache: "no-cache",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify(data),
			});

			response = await response.json();
			this.playerID = response.playerID;
			this.attachPlayerListener();
		}
	}

	async createGame() {
		let url = this.env == "local" ? this.api_local : this.api_prod;
		let data = { playerID: this.playerID };

		if (this.playerID && !this.gameID) {
			let response = await fetch(`${url}/create-game`, {
				method: "POST",
				cache: "no-cache",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			response = await response.json();
			this.gameID = response.gameID;
			this.gameIDRef.textContent = this.gameID;
			this.attachGameListener();
		}
	}

	async joinGame() {
		let url = this.env == "local" ? this.api_local : this.api_prod;
		let gameToJoin = this.joinGameInput.value;
		let data = { playerID: this.playerID };

		if (!gameToJoin) {
			alert("game id cannot be empty");
		} else {
			let response = await fetch(`${url}/join-game/${gameToJoin}`, {
				method: "POST",
				cache: "no-cache",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			response = await response.json();
			this.gameID = response.gameID;
			console.log(this.gameID);
		}
		this.attachGameListener();
	}
}

document.addEventListener("DOMContentLoaded", function () {
	let game = new Game();
	game.init();
});
