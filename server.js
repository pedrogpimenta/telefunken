const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const fs = require('fs')

const tools = require('./helpers/tools.js')
const dbTools = require('./helpers/dbTools.js')

// our localhost port
const port = 4001

// Serve frontend
app.use(express.static(__dirname + '/frontend/build/'));
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});





// on game start
const initNewGame = function(gameId) {
  let thisGameDb = dbTools.getGameDb(gameId)
  
  // set game deck and stock
  dbTools.setGameDb(gameId, {stock: tools.getDeck(2)})
  thisGameDb = dbTools.getGameDb(gameId)

  // put 3 cards on discard pile
  const result = dbTools.getCardsFromStock(gameId, 3)
  dbTools.setGameDb(gameId, {
    stock: result.newStock,
    discard: result.cards,
    currentRound: 1,
    currentTurn: 1
  })
  thisGameDb = dbTools.getGameDb(gameId)

  // give cards to players
  for (i in thisGameDb.players) {
    const thisUsername = thisGameDb.players[i].username
    const result = dbTools.getCardsFromStock(gameId, 11)

    dbTools.setGameDb(gameId, {
      stock: result.newStock,
      player: {
        username: thisUsername,
        hand: result.cards
      }
    })
  }

  // assign first player randomly
  let newPlayersArray = tools.shuffle(thisGameDb.players)
  dbTools.setGameDb(gameId, {
    currentPlayer: newPlayersArray[0].username
  })
}

// new game turn
const setNewTurn = (gameId, newPlayer) => {
  let thisGameDb = dbTools.getGameDb(gameId)
  const currentPlayer = thisGameDb.currentPlayer
  const currentTurn = thisGameDb.currentTurn

  const nextPlayer = thisGameDb.players[dbTools.nextPlayerIndex(gameId)].username

  dbTools.setGameDb(gameId, {
    currentPlayer: nextPlayer,
    currentPlayerHasGrabbedCard: false,
    currentTurn: currentTurn + 1
  })
}

const setNewRound = (gameId) => {
  let thisGameDb = dbTools.getGameDb(gameId)
  const thisTurn = thisGameDb.currentRound
}












console.log('-------------------------------')
console.log('-------------------------------')
console.log('-------------------------------')
console.log('-------------------------------')














// --------------------------------- 
// Socket server stuff
// ---------------------------------

// set namespace 'game'
const game = io.of('/game')








// HELPER: send user info
const sendUserInfo = function(gameId, gameDb, username) {
  for (i in gameDb.players) {
    if (gameDb.players[i].username === username) {
      game.to(gameId).emit('updateUserInfo', gameDb.players[i])
    }
  }
}

// HELPER: send user info to each user
const sendEachUserInfo = function(gameId, gameDb, username) {
  for (i in gameDb.players) {
    game.to(gameDb.players[i].socketId).emit('updateUserInfo', gameDb.players[i])
  }
}

// HELPER: Send game info to all
const sendGameInfo = function(gameId, gameDb) {
  let thisGamePublicDb = gameDb

  // hide first 2 discard pile cards value
  if (thisGamePublicDb.discard.length > 0) {
    thisGamePublicDb.discard[0].value = ''
    thisGamePublicDb.discard[0].suit = ''
    thisGamePublicDb.discard[1].value = ''
    thisGamePublicDb.discard[1].suit = ''
  }

  // Hide stock cards value
  thisGamePublicDb.stock = gameDb.stock.length

  // Hide players hand cards
  for (i in thisGamePublicDb.players) {
    for (h in thisGamePublicDb.players[i].hand) {
      thisGamePublicDb.players[i].hand[h].value = ''
      thisGamePublicDb.players[i].hand[h].suit = ''
    }
  }

  game.to(gameId).emit('updateGame', thisGamePublicDb)
}






// on Init connection to game
game.on('connection', function(socket) {
  console.log('user connected')

  let thisGameId = socket.handshake.query.gameId

  // create empty room in DB if it doesn't exist
  dbTools.setGameDb(thisGameId)

  // Log all connected clients to socket
  //const socketClients = io.sockets.sockets

  // Join specific room
  socket.join(thisGameId)




  // user login
  socket.on('login', function(gameId, username) {
    let thisGameDb = dbTools.getGameDb(thisGameId)
    console.log('user:', username, 'login to:', gameId)

    // Set player
    dbTools.setGameDb(thisGameId, {player: {username: username, socketId: socket.id, isOnline: true}})
    thisGameDb = dbTools.getGameDb(thisGameId)

    // Send saved user info
    sendUserInfo(gameId, thisGameDb, username)

    // Send connected users info
    sendGameInfo(gameId, thisGameDb)
  })






  // start game
  socket.on('start game', function(gameId, username) {
    initNewGame(thisGameId)

    const thisGameDb = dbTools.getGameDb(gameId)

    sendEachUserInfo(gameId, thisGameDb)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('card from stock to user', function(gameId, username) {
    let thisGameDb = dbTools.getGameDb(gameId)

    // stop if current player has already grabbed card
    if (thisGameDb.currentPlayerHasGrabbedCard) { return false }

    const result = dbTools.getCardsFromStock(gameId, 1)

    const nextPlayerIndex = dbTools.nextPlayerIndex(gameId)
    const nextPlayer = thisGameDb.players[nextPlayerIndex].username

    dbTools.setGameDb(gameId, {
      stock: result.newStock,
      currentPlayerHasGrabbedCard: true,
      player: {
        username: username,
        hand: result.cards
      }
    })

    thisGameDb = dbTools.getGameDb(gameId)

    sendUserInfo(gameId, thisGameDb, username)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('card from user to discard', function(gameId, username, card) {
    let thisGameDb = dbTools.getGameDb(gameId)

    // let newPlayerHand = []
    let newDiscard = thisGameDb.discard.slice()

    newDiscard.push(card)

    dbTools.setGameDb(gameId, {
      discard: newDiscard
    })


    setNewTurn(gameId, username)
    thisGameDb = dbTools.getGameDb(gameId)

    // sendUserInfo(gameId, thisGameDb, username)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('update user hand', function(gameId, username, hand) {
    let thisGameDb = dbTools.getGameDb(gameId)
    let numberOfMatches = 0
    for (let p in thisGameDb.players) {
      if (thisGameDb.players[p].username === username) {
        for (let card in hand) {
          for (let serverCard in thisGameDb.players[p].hand) {
            if (hand[card].id === thisGameDb.players[p].hand[serverCard].id) {
              numberOfMatches += 1
            } 
          }
        }
      }
    }
    
    const handLength = hand.length
    if (handLength === numberOfMatches) {
      dbTools.setGameDb(gameId, {
        player: {
          username: username,
          hand: hand
        }
      })
    }
  })

  socket.on('update table', function(gameId, table) {
    dbTools.setGameDb(gameId, {
      table: table
    })

    thisGameDb = dbTools.getGameDb(gameId)
    sendGameInfo(gameId, thisGameDb)
  })







  socket.on('new group', function(gameId, username, content) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    const newGroup = {
      id: tools.guidGenerator(),
      cards: [content.card]
    }

    thisGameDb.table.push(newGroup)

    dbTools.setGameDb(gameId, {
      table: thisGameDb.table
    })

    sendUserInfo(gameId, thisGameDb, username)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('remove card from group', function(gameId, username, content) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    const groupIndex = thisGameDb.table.findIndex(group => group.id === content.groupId)

    let newGroupCards = thisGameDb.table[groupIndex].cards
    newGroupCards.splice(content.removedIndex, 1)

    const isGroupEmpty = !newGroupCards.length

    if (!isGroupEmpty) {
      dbTools.setGameDb(gameId, {
        group: {
          id: thisGameDb.table[groupIndex].id,
          cards: newGroupCards
        }
      })
    } else {
      const thisTable = thisGameDb.table.slice()

      thisTable.splice(groupIndex, 1)
      dbTools.setGameDb(gameId, {
        table: thisTable
      })
    }

    thisGameDb = dbTools.getGameDb(gameId)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('add card to group', function(gameId, username, content) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    const groupIndex = thisGameDb.table.findIndex(group => group.id === content.groupId)

    let newGroupCards = thisGameDb.table[groupIndex].cards
    newGroupCards.splice(content.addedIndex, 0, content.card)

    dbTools.setGameDb(gameId, {
      group: {
        id: thisGameDb.table[groupIndex].id,
        cards: newGroupCards
      }
    })

    sendGameInfo(gameId, thisGameDb)
  })


  socket.on('remove card from player hand', function(gameId, username, content) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    const playerIndex = thisGameDb.players.findIndex(player => player.username === username)
    const cardIndex = thisGameDb.players[playerIndex].hand.findIndex(card => card.id === content.card.id)

    let newHand = thisGameDb.players[playerIndex].hand
    newHand.splice(cardIndex, 1)

    dbTools.setGameDb(gameId, {
      playerRemoveCard: {
        username: thisGameDb.players[playerIndex].username,
        hand: newHand
      }
    })

    sendUserInfo(gameId, thisGameDb, username)
    sendGameInfo(gameId, thisGameDb)
  })

  socket.on('add card to player hand', function(gameId, username, content) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    const playerIndex = thisGameDb.players.findIndex(player => player.username === username)

    let newHand = thisGameDb.players[playerIndex].hand
    newHand.splice(content.addedIndex, 0, content.card)

    dbTools.setGameDb(gameId, {
      player: {
        username: thisGameDb.players[playerIndex].username,
        hand: newHand
      }
    })

    sendUserInfo(gameId, thisGameDb, username)
    sendGameInfo(gameId, thisGameDb)
  })

  










  socket.on('disconnect', function() {
    thisGameDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))

    const doesUserExist = () => {
      let userExists = false
      for (i in thisGameDb.players) {
        if (thisGameDb.players[i].socketId === socket.id) {
          userExists = i 
        }
      }
      return userExists
    }

    const userIndex = doesUserExist()

      console.log('happn disconnect 0')
    // Set user as offline
    console.log(thisGameDb.players)
      console.log('happn disconnect 1')
      thisGameDb.players[userIndex].isOnline = false

    fs.writeFileSync('db/' + thisGameId + '.js', JSON.stringify(thisGameDb), (err) => {})
    sendGameInfo(thisGameId, thisGameDb)

  })

})



http.listen(port, () => console.log(`Listening on port ${port}`))
