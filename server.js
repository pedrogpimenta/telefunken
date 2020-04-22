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

  console.log('init currentRound:', thisGameDb.currentRound)
  const setRoundNumber = thisGameDb.currentRound ? thisGameDb.currentRound + 1 : 1

  console.log('thisGameDb.currentRound:', thisGameDb.currentRound)

  dbTools.setGameDb(gameId, {
    stock: result.newStock,
    discard: result.cards,
    currentRound: setRoundNumber,
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

  if (thisGameDb.currentRound === 1) {
    // if it's the first round assign first player randomly
    let newPlayersArray = tools.shuffle(thisGameDb.players)
    dbTools.setGameDb(gameId, {
      firstPlayer: newPlayersArray[0].username,
      currentPlayer: newPlayersArray[0].username
    })
  } else {
    // if it's a different round, select player next to the first
    let nextPlayerPreIndex = thisGameDb.players.findIndex(player => (player.username === thisGameDb.firstPlayer)) + 1

    if (nextPlayerPreIndex > thisGameDb.players.length - 1) {
      nextPlayerIndex = 0
    } else {
      nextPlayerIndex = nextPlayerPreIndex
    }

    const nextPlayer = thisGameDb.players[nextPlayerIndex].username

    dbTools.setGameDb(gameId, {
      firstPlayer: nextPlayer,
      currentPlayer: nextPlayer
    })
  }

}

// new game turn
const setNewTurn = (gameId, newPlayer) => {
  let thisGameDb = dbTools.getGameDb(gameId)
  const currentPlayer = thisGameDb.currentPlayer
  const currentTurn = thisGameDb.currentTurn

  const nextPlayer = thisGameDb.players[dbTools.nextPlayerIndex(gameId)].username
  const prevPlayer = thisGameDb.currentPlayer

  dbTools.setGameDb(gameId, {
    prevPlayer: prevPlayer,
    currentPlayer: nextPlayer,
    currentPlayerHasGrabbedCard: false,
    currentTurn: currentTurn + 1,
    aPlayerHasBoughtThisTurn: false,
    someoneWantsItBefore: false
  })
}

// round ends
const endThisRound = (gameId) => {
  let thisGameDb = dbTools.getGameDb(gameId)
  dbTools.setGameDb(gameId, {
    currentRoundEnded: true
  })

  // let currentGameDb = {...dbTools.getGameDb(gameId)}
}

// handle buying
const handleBuying = (gameId, username) => {
  let currentGameDb = {...dbTools.getGameDb(gameId)}
  const someoneWantsItBefore = currentGameDb.someoneWantsItBefore

  console.log('start handle buying for:', username)
  console.log('someoneWantsItBefore:', someoneWantsItBefore)

  if (!!someoneWantsItBefore && someoneWantsItBefore !== username) { return false }

  console.log('no one wanted it before:', username)

  // console.log('handleBuying currentGameDb.discard:', currentGameDb.discard)

  let currentDiscard = currentGameDb.discard.slice()
  const playerIndex = currentGameDb.players.findIndex(player => player.username === username)
  let hiddenCardsWereBought = currentGameDb.hiddenCardsWereBought || false

  if (currentGameDb.currentTurn === 1) {
    console.log('turn 1')
    console.log('currentDiscard lengthj:', currentDiscard.length)
    hiddenCardsWereBought = true

    for (let card in currentDiscard) {
      console.log('currentDiscard card:', card)
      const newCard = currentDiscard[card]
      currentGameDb.players[playerIndex].hand.push(newCard)
    }

    currentDiscard.splice(0, 3)

  } else {
    console.log('not turn 1')
    // let currentDiscard = currentGameDb.discard.slice()
    let newCard = currentDiscard[currentDiscard.length - 1]

    currentDiscard.splice(currentDiscard.length - 1, 1)
    currentGameDb.players[playerIndex].hand.push(newCard)
  }

  const result = dbTools.getCardsFromStock(gameId, 1)

  for (let i in result.cards) {
    currentGameDb.players[playerIndex].hand.push(result.cards[i]) 
  }

  dbTools.setGameDb(gameId, {
    stock: result.newStock,
    discard: currentDiscard,
    aPlayerHasBoughtThisTurn: true,
    hiddenCardsWereBought: hiddenCardsWereBought,
    player: {
      username: currentGameDb.players[playerIndex].username,
      hand: currentGameDb.players[playerIndex].hand
    }
  }) 

  game.to(gameId).emit('player wants to buy', false)

  currentGameDb = dbTools.getGameDb(gameId)

  sendUserInfo(gameId, currentGameDb, username)
  sendGameInfo(gameId, currentGameDb) 
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

  // Hide stock cards value
  thisGamePublicDb.stock = gameDb.stock.length

  // hide first 2 discard pile cards value
  if (!thisGamePublicDb.hiddenCardsWereBought && thisGamePublicDb.discard.length > 1) {
    thisGamePublicDb.discard[0].value = null
    thisGamePublicDb.discard[0].suit = null
    thisGamePublicDb.discard[1].value = null
    thisGamePublicDb.discard[1].suit = null
  }

  const sendEverything = gameDb.currentRoundEnded

  if (sendEverything) {
    console.log('########### SEND EVERYTHING')
    game.to(gameId).emit('updateGame', gameDb)
  } else {

    console.log('########### SEND not EVERYTHING')
    // Hide players hand cards
    for (i in thisGamePublicDb.players) {
      for (h in thisGamePublicDb.players[i].hand) {
        thisGamePublicDb.players[i].hand[h].value = null
        thisGamePublicDb.players[i].hand[h].suit = null
      }
    }

    game.to(gameId).emit('updateGame', thisGamePublicDb)
  }
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

    const thisPlayerIndex = thisGameDb.players.findIndex(player => player.username === username)

    if (thisGameDb.players[thisPlayerIndex].hand.length === 0) {
      endThisRound(gameId)
    } else if (thisGameDb.players[thisPlayerIndex].hand.length === 1) {
      if (thisGameDb.players[thisPlayerIndex].hand[0].id === card.id) {
        endThisRound(gameId)
      }
    } else {
      setNewTurn(gameId, username)
    }


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

  socket.on('player buys', function(gameId, username) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    // stop if someone already bought on this turn
    if (thisGameDb.aPlayerHasBoughtThisTurn) { return false }

    console.log(`${username} wants to buy`)

    dbTools.setGameDb(gameId, {
      playerIsBuying: username
    }) 

    if (thisGameDb.currentPlayer === username) {
      handleBuying(gameId, username)
    } else {
      game.to(gameId).emit('player wants to buy', username)

      setTimeout(() => {handleBuying(gameId, username)}, 10000)
    }
  })

  socket.on('i want it before', function(gameId, username) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}

    console.log('i want it before:', username)

    dbTools.setGameDb(gameId, {
      someoneWantsItBefore: username
    }) 

    if (thisGameDb.currentPlayer === username) {
      handleBuying(gameId, username)
    } else {
      game.to(gameId).emit('player wants to buy', username)

      setTimeout(() => {handleBuying(gameId, username)}, 10000)
    }
  })

  socket.on('start new round', function(gameId) {
    let thisGameDb = {...dbTools.getGameDb(gameId)}
    console.log('yeas')

    for (let i in thisGameDb.players) {
      thisGameDb.players[i].hand = []
    }

    dbTools.setGameDb(gameId, {
      players: thisGameDb.players,
      discard: [],
      stock: [],
      table: [],
      currentRoundEnded: false,
      currentTurn: 0,
      currentPlayerHasGrabbedCard: false
    })

    initNewGame(gameId)

    const newGameDb = dbTools.getGameDb(gameId)

    sendEachUserInfo(gameId, newGameDb)
    sendGameInfo(gameId, newGameDb)
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

      // console.log('happn disconnect 0')
    // Set user as offline
    // console.log(thisGameDb.players)
      // console.log('happn disconnect 1')
      // thisGameDb.players[userIndex].isOnline = false

    fs.writeFileSync('db/' + thisGameId + '.js', JSON.stringify(thisGameDb), (err) => {})
    sendGameInfo(thisGameId, thisGameDb)

  })

})



http.listen(port, () => console.log(`Listening on port ${port}`))
