// const { runInThisContext } = require("vm");

class Game {
    constructor() {
        this.db = firebase.firestore();
        this.commandsRef = this.db.collection('commands');
        this.playerRef = this.db.collection('players');
        this.gameRef = this.db.collection('players');
        this.boardRef = document.getElementById('board');
        this.createGameBtn = document.getElementById('createGameBtn');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.baseURL = 'https://us-central1-tictactoe-func.cloudfunctions.net/api/';
    }

    init() {
        this.makeBoard();
        this.getPlayerID();
        this.addListeners();
    }

    addListeners() {
        this.createGameBtn.addEventListener('click', () => this.createGame());
        this.joinGameBtn.addEventListener('click', () => this.joinGame());
    }

    makeBoard() {
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                let cell = document.createElement('div');
                cell.setAttribute('id', `cell-${i}-${j}`);
                cell.addEventListener('click', () => this.makeMove(cell.id));
                this.boardRef.appendChild(cell);
            }
        }
    }

    async getPlayerID() {
        if(!this.playerID) {
            this.name = prompt('enter username pls');
            let response = await fetch(`${this.baseURL}create-player/${this.name}`);
            response = await response.json();
            this.playerID = response.playerID;
        }
    }

    async createGame() {
        if(this.playerID && !this.gameID) {
            let response = await fetch(
                `${this.baseURL}create-game/${this.playerID}`
            );
            response = await response.json();
            this.gameID = response.gameID;
        }
        console.log(this.playerID, this.gameID);
    }

    async makeMove(cell) {
        let doc = this.commandsRef.add({
            
        })
    }
    
}


window.onload = () => {
	let game = new Game();
	game.init();
};