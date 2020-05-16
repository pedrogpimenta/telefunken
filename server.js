const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongodb = require('mongodb')
// const ObjectID = mongodb.ObjectID
// const fs = require('fs')
const _ = require('lodash')

const tools = require('./helpers/tools.js')
const dbTools = require('./helpers/dbTools.js')

// our localhost port
const port = process.env.PORT || 4001

// Serve frontend
app.use(express.static(__dirname + '/frontend/build/'));
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/frontend/build/index.html');
});

// Start Db connection
var ROOMS_COLLECTION = 'rooms'
let telefunkenDb = {}
mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Telefunken', {useUnifiedTopology: true}, function(err, client) {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  telefunkenDb = client.db()
})

// --------------------------------- 
// Helpers 
// ---------------------------------

// start new game / round
const initNewGame = function(roomId) {

  const cardsToPlayer = (deck, n) => {
    const cards = deck.splice(deck.length - n, n)
    return cards
  }

  telefunkenDb.collection(ROOMS_COLLECTION).findOne({
    name: roomId
  }).then(roomObject => {

    // make new deck
    roomObject.stock = tools.getDeck(2)

    // grab 3 cards for discard
    roomObject.discard = roomObject.stock.splice(roomObject.stock.length - 3, 3)

    // set new round
    roomObject.rounds.push({
      roundHasEnded: false,
      currentTurn: 1,
      playerPoints: []
    })

    let players = []

    if (!roomObject.players.length) {
      players = roomObject.connectedUsers.map(user => {
        // add player info to this round
        // roomObject.rounds.playerPoints.push({name: user.name, points: 0})
  
        // put cards on player hand
        user.hand = cardsToPlayer(roomObject.stock, 11)
        return user
      })

      // put users on players 
      roomObject.players = players
      // remove connected users
      roomObject.connectedUsers = []

      // set first player randomly
      const firstPlayer = tools.shuffle(players)[Math.floor(Math.random() * ((players.length - 1) - 0 + 1) + 0)].name
      roomObject.firstPlayer = firstPlayer
      roomObject.currentPlayer = firstPlayer
    } else {
      players = roomObject.players.map(user => {
        // add player info to this round
        // roomObject.rounds.playerPoints.push({name: user.name, points: 0})
  
        // put cards on player hand
        user.hand = cardsToPlayer(roomObject.stock, 11)
        return user
      })
      // put users on players 
      roomObject.players = players
      const nextPlayerIndex = tools.getNextPlayer(players, roomObject.currentPlayer)
      roomObject.currentPlayer = players[nextPlayerIndex].name
    }

    // set game has started
    roomObject.gameHasStarted = true

    // set roomObject for mongo
    const updatedRoom = { $set: roomObject }

    telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
      name: roomId
    }, updatedRoom, function(err, doc) {
      if (err)  {
        // TODO: error message
        game.to(roomId).emit('error')
      } else {
        // update game to users
        sendGameInfo(roomId)
      }
    })
  })
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

  //sendUserInfo(gameId, username)
  //sendGameInfo(gameId, currentGameDb) 
}

// HELPER: send user info
// const sendUserInfo = function(gameId, username) {
//   telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//     name: gameId
//   }).then((gameDb) => {
//     for (i in gameDb.players) {
//       if (gameDb.players[i].username === username) {
//         game.to(gameId).emit('updateUserInfo', gameDb.players[i])
//       }
//     }
//   })
// }

// HELPER: send user info to each user
// const sendEachUserInfo = function(gameId, gameDb, username) {
//   for (i in gameDb.players) {
//     game.to(gameDb.players[i].socketId).emit('updateUserInfo', gameDb.players[i])
//   }
// }

// HELPER: Send game info to all
const sendGameInfo = function(roomId) {
  telefunkenDb.collection(ROOMS_COLLECTION).findOne({
    name: roomId
  }).then((gameDb) => {
    if (gameDb.currentRoundEnded) {
      console.log('########### SEND EVERYTHING')
      const thisGameDb = _.cloneDeep(gameDb)

      thisGameDb.stock = gameDb.stock.length
      game.to(roomId).emit('updateGame', thisGameDb)
      return false
    }

    if (!!gameDb.players.length) {
      for (let i in gameDb.players) {
        const thisGameDb = _.cloneDeep(gameDb)
        const thisUserName = gameDb.players[i].name

        // hide stock cards value
        thisGameDb.stock = gameDb.stock.length

        // hide first 2 discard pile cards value
        if (!thisGameDb.hiddenCardsWereBought && thisGameDb.discard.length > 1) {
          thisGameDb.discard[0].value = null
          thisGameDb.discard[0].suit = null
          thisGameDb.discard[1].value = null
          thisGameDb.discard[1].suit = null
        }

        // Hide players hand cards
        for (let p in thisGameDb.players) {
          if (thisGameDb.players[i].name !== thisGameDb.players[p].name) {
            for (h in thisGameDb.players[p].hand) {
              thisGameDb.players[p].hand[h].value = null
              thisGameDb.players[p].hand[h].suit = null
            }
          }
        }

        console.log('########### SEND not EVERYTHING')
        game.to(thisGameDb.players[i].socketId).emit('updateGame', thisGameDb)
      }
    }

    if (!!gameDb.connectedUsers.length) {
      for (let i in gameDb.connectedUsers) {
        const thisGameDb = _.cloneDeep(gameDb)

        // hide stock cards value
        thisGameDb.stock = gameDb.stock.length

        // hide first 2 discard pile cards value
        if (!thisGameDb.hiddenCardsWereBought && thisGameDb.discard.length > 1) {
          thisGameDb.discard[0].value = null
          thisGameDb.discard[0].suit = null
          thisGameDb.discard[1].value = null
          thisGameDb.discard[1].suit = null
        }

        // Hide players hand cards
        for (let p in thisGameDb.players) {
          for (h in thisGameDb.players[p].hand) {
            thisGameDb.players[p].hand[h].value = null
            thisGameDb.players[p].hand[h].suit = null
          }
        }

        console.log('########### SEND not EVERYTHING')
        game.to(thisGameDb.connectedUsers[i].socketId).emit('updateGame', thisGameDb)
      }
    }
  })
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

// on Init connection to game
game.on('connection', function(socket) {
  console.log('user connected:', socket.id)

  let thisGameId = socket.handshake.query.gameId

  // set newRoom defaults
  const newRoom = {
    createDate: new Date(),
    name: thisGameId,
    game: 'telefunken',
    gameHasStarted: false,
    direction: 'clockwise',
    totalRounds: 6,
    connectedUsers: [],
    deck: [], // TODO: Put cards here
    stock: [],
    discard: [],
    hiddenCardsWereBought: false,
    table: [],
    rounds: [],
    players: [],
    firstPlayer: '',
    currentPlayer: '',
    currentPlayerHasGrabbedCard: false,
    playerWantsToBuy: '',
    playerWantsItBefore: '',
    playerHasBought: false,
  }

  // check if room exists
  const doesRoomExist = async () => {
    const response = await telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: thisGameId
    })

    return !!response
  }

  doesRoomExist().then((response) => {
    roomExists = !!response

    if (roomExists) {
      // TODO: this doesn't do nothing
      // TODO: make a standard message/error sending method?
      game.to(thisGameId).emit('room already exists')

    } else {
      if (!thisGameId) {
        // TODO: this doesn't do nothing
        // TODO: make a standard message/error sending method?
        game.to(thisGameId).emit('please insert name')

      } else {
        telefunkenDb.collection(ROOMS_COLLECTION).insertOne(newRoom, function(err, doc) {
          if (err) {
            game.to(thisGameId).emit('failed to create room')
          }
        })
      }
    }
  })

  // socket join room
  socket.join(thisGameId)

  // ------------------- 
  // user actions from frontend
  // ------------------- 

  // user login
  socket.on('login', function(roomId, username) {
    telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: roomId
    }).then((gameDb) => {

      const userAlreadyPlaying = () => {
        for (let i in gameDb.players) {
          if (gameDb.players[i].name === username) {
            return gameDb.players[i]
          }
        }
      }

      const arrayFilters = { arrayFilters: [ { 'element.name': username } ], upsert: true }

      if (!!userAlreadyPlaying()) {
        const thisUser = userAlreadyPlaying()
        thisUser.socketId = socket.id
        thisUser.isOnline = true

        const pushDoc = { $push: { players: thisUser } }
        const updateDoc = { $set: { 'players.$[element]': thisUser } }

        telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
          name: roomId,
          'players.name': { $ne: username }
        }, pushDoc, function(err, doc) {
          if (err)  {
            // TODO: error message
            game.to(thisGameId).emit('error')
          } else {
            if (doc.result.nModified === 0) {
              updateUser(updateDoc)
            } else {
              sendGameInfo(roomId)
            }
          }
        })
      } else {
        const newUser = {
          name: username,
          socketId: socket.id,
          isOnline: true
        }

        const pushDoc = { $push: { connectedUsers: newUser } }
        const updateDoc = { $set: { 'connectedUsers.$[element]': newUser } }

        telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
          name: roomId,
          'connectedUsers.name': { $ne: username }
        }, pushDoc, function(err, doc) {
          if (err)  {
            // TODO: error message
            game.to(thisGameId).emit('error')
          } else {
            if (doc.result.nModified === 0) {
              updateUser(updateDoc)
            } else {
              sendGameInfo(roomId)
            }
          }
        })
      }

      // happens if user exists
      const updateUser = (doc) => {
        telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
          name: roomId
        }, doc, arrayFilters, function(err, doc) {
          if (err)  {
            // TODO: error message
            game.to(thisGameId).emit('error')
          } else {
            sendGameInfo(roomId)
          }
        })
      }
    })
  })

  // start game
  socket.on('start game', function(gameId, username) {
    console.log('on start game, gameId:', gameId)
    initNewGame(gameId)
  })

  socket.on('card from stock to user', function(roomId, username) {
    telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: roomId
    }).then(roomObject => {
      // stop if current player has already grabbed card
      if (roomObject.currentPlayerHasGrabbedCard) { return false }

      // helper: get cards from stock
      const getCardsFromStock = (n) => {
        const cards = roomObject.stock.splice(roomObject.stock.length - n, n)
        return cards
      }

      // add cards to player hand
      const thisPlayerIndex = roomObject.players.findIndex(player => player.name === username)
      roomObject.players[thisPlayerIndex].hand = roomObject.players[thisPlayerIndex].hand.concat(getCardsFromStock(1))

      // disable further getting new cards
      roomObject.currentPlayerHasGrabbedCard = true

      // get next player
      nextPlayerIndex = tools.getNextPlayer(roomObject.players, roomObject.currentPlayer)
      roomObject.nextPlayer = roomObject.players[nextPlayerIndex].username

      const updateDoc = { $set: roomObject }

      telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
        name: roomId
      }, updateDoc, function(err, doc) {
        if (err)  {
          // TODO: hanlde error
        } else {
          sendGameInfo(roomId)
        }
      })
    })
  })

  socket.on('card movement', function(roomId, username, cardMovement) {
    telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: roomId
    }).then(roomObject => {
      const playerIndex = roomObject.players.findIndex(player => player.name === username)
      let card = {}

      if (cardMovement.from === 'player') {
        card = roomObject.players[playerIndex].hand[cardMovement.fromPosition]
        roomObject.players[playerIndex].hand.splice(cardMovement.fromPosition, 1)
      } else {
        const groupId = roomObject.table.findIndex(group => group.id === cardMovement.from)

        card = roomObject.table[groupId].cards[cardMovement.fromPosition]
        roomObject.table[groupId].cards.splice(cardMovement.fromPosition, 1)

        if (roomObject.table[groupId].cards.length === 0) {
          roomObject.table.splice(groupId, 1)
        }
      }

      if (cardMovement.to === 'player') {
        roomObject.players[playerIndex].hand.splice(cardMovement.toPosition, 0, card)
      } else if (cardMovement.to === 'discard') {
        roomObject.discard.push(card)

        if (roomObject.players[playerIndex].hand.length === 0) {
          roomObject.currentRoundEnded = true
          roomObject.prevPlayer = null
        // } else if (roomObject.players[playerIndex].hand.length === 1) {
        //   if (roomObject.players[playerIndex].hand[0].id === card.id) {
        //     roomObject.currentRoundEnded = true
        //   }
        } else {
          const currentTurn = roomObject.rounds[roomObject.rounds.length - 1].currentTurn
          const nextPlayer = roomObject.players[tools.getNextPlayer(roomObject.players, roomObject.currentPlayer)].name
          const prevPlayer = roomObject.currentPlayer
        
          roomObject.prevPlayer = prevPlayer
          roomObject.currentPlayer = nextPlayer
          roomObject.currentPlayerHasGrabbedCard = false
          roomObject.currentTurn = currentTurn + 1
          roomObject.aPlayerHasBoughtThisTurn = false
          roomObject.someoneWantsItBefore = false
        }
      } else if (cardMovement.to === 'table') {
        const newGroup = {
          id: tools.guidGenerator(),
          cards: [card]
        }
    
        roomObject.table.push(newGroup)
      } else {
        const groupId = roomObject.table.findIndex(group => group.id === cardMovement.to)

        roomObject.table[groupId].cards.splice(cardMovement.toPosition, 0, card)
      }

      const updateDoc = { $set: roomObject }

      telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
        name: roomId
      }, updateDoc, function(err, doc) {
        if (err)  {
          // TODO: hanlde error
        } else {
          sendGameInfo(roomId)
        }
      })
    })


  });

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

  socket.on('start new round', function(roomId) {
    telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: roomId
    }).then(roomObject => {
      for (let i in roomObject.players) {
        roomObject.players[i].hand = []
      }
      roomObject.discard = []
      roomObject.stock = []
      roomObject.table = []
      roomObject.currentRoundEnded = false
      roomObject.prevPlayer = null
      roomObject.currentTurn = 0
      roomObject.currentPlayerHasGrabbedCard = false

      const updateDoc = { $set: roomObject }

      telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
        name: roomId
      }, updateDoc, function(err, doc) {
        if (err)  {
          // TODO: hanlde error
        } else {
          initNewGame(roomId)
        }
      })
    })
  })


  socket.on('disconnect', function() {
    telefunkenDb.collection(ROOMS_COLLECTION).findOne({
      name: thisGameId
    }).then((gameDb) => {

      const userAlreadyPlaying = () => {
        for (let i in gameDb.players) {
          if (gameDb.players[i].socketId === socket.id) {
            return gameDb.players[i]
          }
        }
      }

      if (!!userAlreadyPlaying()) {
        const updatedUser = userAlreadyPlaying()
        updatedUser.isOnline = false

        const updateDoc = { $set: { 'players.$[element]': updatedUser } }
        const arrayFilters = { arrayFilters: [ { 'element.socketId': socket.id } ], upsert: true }

        telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
          name: thisGameId
        }, updateDoc, arrayFilters, function(err, doc) {
          if (err)  {
            // TODO: hanlde error
          } else {
            sendGameInfo(thisGameId)
          }
        })
      } else {
        const updateDoc = { $pull: { 'connectedUsers': { socketId: socket.id } } }

        telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
          name: thisGameId
        }, updateDoc, function(err, doc) {
          if (err)  {
            // TODO: hanlde error
          } else {
            sendGameInfo(thisGameId)
          }
        })
      }
    })
  })
})

http.listen(port, () => console.log(`Listening on port ${port}`))