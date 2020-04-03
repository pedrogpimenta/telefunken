const fs = require('fs')
const tools = require('./tools.js')

// Set initial game database
const initialGameDb = {
  gameId: '',
  deck: [],
  stock: [],
  discard: [],
  totalRounds: 6,
  currentRound: 1,
  direction: '',
  startingPlayer: '',
  currentPlayerTurn: '',
  table: [],
  players: []
}

const initialPlayerInfo = {
  id: '',
  socketId: '',
  username: '',
  hand: [],
  buys: 6,
  totalPoints: 0,
  isOnline: true,
  events: []
}

const initialPlayerEventsInfo = {
  roundNumber: 1, // number of the round
  buys: 0, // how many buys in this round
  points: 0 // if 0, player cut in this round
}

const setInitialGameDb = (newGameId) => {
  const newInitialGameDb = initialGameDb
  newInitialGameDb.gameId = newGameId
  return newInitialGameDb
}


module.exports = {
  getGameDb: function(gameId) {
    const doesDbExist = fs.existsSync('db/' + gameId + '.js')
    if (doesDbExist) {
      const gameDb = JSON.parse(fs.readFileSync('db/' + gameId + '.js', 'utf8'))
      return gameDb
    } else {
      return 'no gameDb'
    }
  },

  setGameDb: function(gameId, gameDb) {
    console.log('--- set db')

    // (not used anymore) if receive gameDb

    //console.log('new db info sent')
    const doesDbExist = fs.existsSync('db/' + gameId + '.js') 

    // if db exists
    if (doesDbExist) {
      let currentGameDb = this.getGameDb(gameId)
      console.log('db exists:', gameId)

      //console.log('currentGameDb.players', currentGameDb.players)

      // loop through sent keys/value
      for (let key in gameDb) {
        //console.log('each key in gameDb. key:', key)

        // if sending player info
        if (key === 'player') {
          //console.log('key is player')

          // check if any player exists
          if (currentGameDb.players.length > 0) {
            //console.log('there are players in current db')
            // for each current db player

            let doesUserExist = false
            for (let i in currentGameDb.players) {
              //console.log('each player in currentGameDb. i:', i, 'value.username:', currentGameDb.players[i].username)
              //console.log('this player info. i:', gameDb.player.username)

              if (currentGameDb.players[i].username === gameDb.player.username) {
                //console.log('user matches:', gameDb.player.username)

                doesUserExist = true
                // for each key in current player from current db
                for (let key in currentGameDb.players[i]) {
                  const currentDbPlayerKey = key
                  //console.log('each user key:', key)

                  // for each key in player from new info
                  for (let key in gameDb.player) {
                    // if key matches
                    if (key === currentDbPlayerKey) {
                      //console.log('|| WHAT', key, currentDbPlayerKey, gameDb.player[key])
                      if (key === 'hand') {
                        for (cardIndex in gameDb.player[key]) {
                          currentGameDb.players[i]['hand'].push(gameDb.player[key][cardIndex])
                        }
                      } else {
                        currentGameDb.players[i][key] = gameDb.player[key]
                      }
                    }
                  }

                }
              }

            }

            if (!doesUserExist) {
              console.log('user doesnt exist, create new:', gameDb.player.username)
              let newPlayer = initialPlayerInfo
              newPlayer.id = tools.guidGenerator()
              // for each key in current player from current db
              for (let key in newPlayer) {
                const newPlayerKey = key
                // for each key in player from new info
                for (let key in gameDb.player) {
                  // if key matches
                  if (key === newPlayerKey) {
                    newPlayer[key] = gameDb.player[key]
                  }
                }
              }
              currentGameDb.players.push(newPlayer)
            }
          } else {
            //console.log('no users, create first')
            let newPlayer = initialPlayerInfo
            newPlayer.id = tools.guidGenerator()
            // for each key in current player from current db
            for (let key in newPlayer) {
              const newPlayerKey = key
              // for each key in player from new info
              for (let key in gameDb.player) {
                // if key matches
                if (key === newPlayerKey) {
                  newPlayer[key] = gameDb.player[key]
                }
              }
            }
            currentGameDb.players.push(newPlayer)
          }
        } else {
          //console.log('key not player, set others')
          // set regular/simple keys
          currentGameDb[key] = gameDb[key]
        }
      }

      // save new info to db
      //console.log('save info1')
      fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(currentGameDb), (err) => {})
    } else {
      // save initial info to db with name "gameId"
      console.log('db doesnt exist, creating new:', gameId)
      fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(setInitialGameDb(gameId)), (err) => {})
    }

    //console.log('--- set db END ---')
    //console.log('gameDb:', this.getGameDb(gameId))
  },

  getCardsFromStock: function(gameId, n) {
    const prevStock = this.getGameDb(gameId).stock
    let nextStock = []
    let cards = []
    for (i in prevStock) {
      nextStock.push(prevStock[i])

      if (i >= (prevStock.length - n)) {
        cards.push(prevStock[i])
      }
    }

    nextStock.splice(prevStock.length - n, n)

    return {newStock: nextStock, cards}
  },

}
