Without authentication
    * get username, push player to player collection
    * base url __/api/
        @route: create-player/<username>
    * create game 
        @route: create-game/<player-id>
    * join game
        @route: join-game/<game-id>/player/<player-id>
    
    moves could be pushed to the commands collection, or could be handles through http requests

    *collection method
        * push move command to the collection
            * push the game-id, player-id, cell
        * Listen to changes on cloud functions
            * check whether cell is within bounds
            * check if its the player's turn
                * if yes, make the move
                    * check for winner
                    * toggle the turn attribute
                * else dont allow move, update player msg


    command types
    * move
        * game id
        * player id
        * cell number
    * ping/pong
        * not decided yet
                 
    