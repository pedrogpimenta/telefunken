const fs = require('fs')
const tools = require('./tools.js')

// Set initial game database
const initialGameDb = {
  gameId: '',
  deck: [],
  stock: [],
  discard: [],
  totalRounds: 6,
  currentRound: 0,
  currentTurn: 0,
  currentPlayer: '',
  currentPlayerHasGrabbedCard: false,
  direction: 'clockwise',
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
  hasGrabbedCard: false,
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

    const doesDbExist = fs.existsSync('db/' + gameId + '.js') 

    // if db exists
    if (doesDbExist) {
      let currentGameDb = this.getGameDb(gameId)
      console.log('db exists:', gameId)

      // loop through sent keys/value
      for (let key in gameDb) {

        // if sending player info
        if (key === 'player') {

          // check if any player exists
          if (currentGameDb.players.length > 0) {
            // for each current db player

            let doesUserExist = false
            for (let i in currentGameDb.players) {

              if (currentGameDb.players[i].username === gameDb.player.username) {

                doesUserExist = true
                // for each key in current player from current db
                for (let key in currentGameDb.players[i]) {
                  const currentDbPlayerKey = key
                  // for each key in player from new info
                  for (let key in gameDb.player) {
                    // if key matches
                    if (key === currentDbPlayerKey) {
                      if (key === 'hand') {
                        console.log('currenthand:', currentGameDb.players[i]['hand'].length)
                        console.log('hand:', gameDb.player[key].length)
                        if (gameDb.player[key].length > 1) {
                          currentGameDb.players[i]['hand'] = gameDb.player[key]
                        } else {
                          for (cardIndex in gameDb.player[key]) {
                            currentGameDb.players[i]['hand'].push(gameDb.player[key][cardIndex])
                          }
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
        } else if (key === 'playerRemoveCard') {
          const thisPlayerUsername = gameDb[key].username 
          const thisIndex = currentGameDb.players.findIndex(player => player.username === thisPlayerUsername)

          currentGameDb.players[thisIndex].hand = gameDb[key].hand

        } else if (key === 'group') {
          let thisTable = currentGameDb.table.slice()
          const thisGroupId = gameDb[key].id 

          const thisGroupIndex = thisTable.findIndex(group => group.id === thisGroupId)

          thisTable[thisGroupIndex].cards = gameDb[key].cards

          currentGameDb.table = thisTable
        } else {
          // set regular/simple keys
          currentGameDb[key] = gameDb[key]
        }
      }

      // save new info to db
      fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(currentGameDb), (err) => {})
    } else {
      // save initial info to db with name "gameId"
      console.log('db doesnt exist, creating new:', gameId)
      fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(setInitialGameDb(gameId)), (err) => {})
    }
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

  nextPlayerIndex: function(gameId) {
    const thisGameDb = this.getGameDb(gameId)

    for (i in thisGameDb.players) {
      console.log('i:', i)
      if (thisGameDb.players[i].username === thisGameDb.currentPlayer) {
        if ((parseInt(i) + 1) > (thisGameDb.players.length - 1)) {
          return 0
        } else {
          return parseInt(i) + 1
        }
      }
    }
  }
}
