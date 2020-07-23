const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongodb = require('mongodb')
const WebSocket = require('ws')
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
      const nextPlayerIndex = tools.getNextPlayer(players, roomObject.firstPlayer)
      roomObject.currentPlayer = roomObject.players[nextPlayerIndex].name
      roomObject.firstPlayer = roomObject.players[nextPlayerIndex].name
    }

    // set game has started
    roomObject.gameHasStarted = true

    // reset showing hidden cards
    roomObject.hiddenCardsWereBought = false

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
const sendGameInfo = function(gameId) {
  telefunkenDb.collection(ROOMS_COLLECTION).findOne({
    name: gameId
  }).then((gameDb) => {
    
    if (!!gameDb.players.length) {
      for (let i in gameDb.players) {

        if (gameDb.currentRoundEnded) {
          console.log('########### SEND EVERYTHING')
          const thisGameDb = _.cloneDeep(gameDb)
    
          thisGameDb.stock = gameDb.stock.length
          wsSendToOne(thisGameDb.players[i].name, {action: 'updateGame', data: thisGameDb})
          return false
        }

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
        wsSendToOne(thisGameDb.players[i].name, {action: 'updateGame', data: thisGameDb})
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
        wsSendToOne(thisGameDb.connectedUsers[i].name, {action: 'updateGame', data: thisGameDb})
      }
    }
  })
}

console.log('----S------------------------')
console.log('---------T-------------------')
console.log('--------------A--------------')
console.log('-------------------R---------')
console.log('------------------------T----')

// --------------------------------- 
// Socket server stuff
// ---------------------------------

const wss = new WebSocket.Server({port: 4001});
const CLIENTS = [];

const wsSendAll = content => {
  for (var i=0; i<CLIENTS.length; i++) {
    CLIENTS[i].ws.send(content)
  }
}

const wsSendToOne = (clientName, content) => {
  for (var i=0; i<CLIENTS.length; i++) {
    if (CLIENTS[i].clientName === clientName) {
      console.log('### SEND TO PLAYER: ', clientName)
      CLIENTS[i].ws.send(JSON.stringify({action: content.action, data: content.data}))
    }
  }
}

wss.on('connection', ws => {

  ws.on('message', data => {
    const content = JSON.parse(data);
    const action = content.action;
    const clientName = content.clientName;
    const gameId = content.gameId;

    const doesClientExist = (clientName) => {
      let clientExists = false

      for (let i in CLIENTS) {
        if (CLIENTS[i].clientName === clientName) {
          clientExists = true
        }
      }

      return clientExists;
    }

    if (!doesClientExist(clientName)) {
      CLIENTS.push({
        clientName: clientName,
        gameId: gameId,
        ws: ws,
      });
    } else {
      for (let i in CLIENTS) {
        if (CLIENTS[i].clientName === clientName) {
          CLIENTS[i].ws = ws
        }
      }
    }

    switch (action) {

      case 'connect':
        console.log(`Client ${clientName} connected => ${gameId}`)

        // set newRoom defaults
        const newRoom = {
          createDate: new Date(),
          name: gameId,
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
          pauseTime: 30,
          cooldownTime: 5,
          alsoWants: []
        }

        // check if room exists
        const doesRoomExist = async () => {
          const response = await telefunkenDb.collection(ROOMS_COLLECTION).findOne({
            name: gameId
          })

          return !!response
        }

        doesRoomExist().then((response) => {
          roomExists = !!response

          if (roomExists) {
            // TODO: this doesn't do nothing
            // TODO: make a standard message/error sending method?
            // game.to(thisGameId).emit('room already exists')
          } else {
            if (!gameId) {
              // TODO: this doesn't do nothing
              // TODO: make a standard message/error sending method?
              // game.to(thisGameId).emit('please insert name')

            } else {
              telefunkenDb.collection(ROOMS_COLLECTION).insertOne(newRoom, function(err, doc) {
                if (err) {
                  // TODO: this doesn't do nothing
                  // TODO: make a standard message/error sending method?
                  // game.to(thisGameId).emit('failed to create room')
                }
              })
            }
          }
        })


        // wsSendAll(clientName);

        telefunkenDb.collection(ROOMS_COLLECTION).findOne({
          name: gameId
        }).then((gameDb) => {

          const userAlreadyPlaying = () => {
            if (!!gameDb) {
              if (!!gameDb.players) {
                for (let i in gameDb.players) {
                  if (gameDb.players[i].name === clientName) {
                    return gameDb.players[i]
                  }
                }
                return false
              } else {
                return false
              }
            } else {
              return false
            }
          }

          const arrayFilters = { arrayFilters: [ { 'element.name': clientName } ], upsert: true }

          if (!!userAlreadyPlaying()) {
            const thisUser = userAlreadyPlaying()
            thisUser.ws = ws
            thisUser.isOnline = true

            const pushDoc = { $push: { players: thisUser } }
            const updateDoc = { $set: { 'players.$[element]': thisUser } }

            telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
              name: gameId,
              'players.name': { $ne: clientName }
            }, pushDoc, function(err, doc) {
              if (err)  {
                // TODO: error message
                ws.send('error')
              } else {
                if (doc.result.nModified === 0) {
                  updateUser(updateDoc)
                } else {
                  sendGameInfo(gameId)
                }
              }
            })
          } else {
            const newUser = {
              name: clientName,
              isOnline: true
            }

            const pushDoc = { $push: { connectedUsers: newUser } }
            const updateDoc = { $set: { 'connectedUsers.$[element]': newUser } }

            telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
              name: gameId,
              'connectedUsers.name': { $ne: clientName }
            }, pushDoc, function(err, doc) {
              if (err)  {
                // TODO: error message
                ws.send('error')
              } else {
                if (doc.result.nModified === 0) {
                  updateUser(updateDoc)
                } else {
                  sendGameInfo(gameId)
                }
              }
            })
          }

          // happens if user exists
          const updateUser = (doc) => {
            telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
              name: gameId
            }, doc, arrayFilters, function(err, doc) {
              if (err)  {
                // TODO: error message
                ws.send('error')
              } else {
                sendGameInfo(gameId)
              }
            })
          }
        })
        
        break;

      case 'start game':
        console.log('on start game, gameId:', gameId)
        initNewGame(gameId)

        break;

      case 'disconnect':
        console.log('Player disconnected =>', clientName)

        break;

      default:
        console.log('ERROR: no \'action\' defined')
    }

    // ws.send(content)

  })


  // console.log('clients:', wss.clients)

})

// // set namespace 'game'
// const game = io.of('/game')

// // on Init connection to game
// game.on('connection', function(socket) {
//   console.log('user connected:', socket.id)


//   let thisGameId = socket.handshake.query.gameId




//   // socket join room
//   socket.join(thisGameId)

//   // ------------------- 
//   // user actions from frontend
//   // ------------------- 

/******* DONE UNTIL HERE ************/

//   socket.on('card from stock to user', function(roomId, username) {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
//       // stop if current player has already grabbed card
//       if (roomObject.currentPlayerHasGrabbedCard) { return false }

//       // helper: get cards from stock
//       const getCardsFromStock = (n) => {
//         const cards = roomObject.stock.splice(roomObject.stock.length - n, n)
//         return cards
//       }

//       // add cards to player hand
//       const thisPlayerIndex = roomObject.players.findIndex(player => player.name === username)
//       roomObject.players[thisPlayerIndex].hand = roomObject.players[thisPlayerIndex].hand.concat(getCardsFromStock(1))

//       // disable further getting new cards
//       roomObject.currentPlayerHasGrabbedCard = true

//       // get next player
//       nextPlayerIndex = tools.getNextPlayer(roomObject.players, roomObject.currentPlayer)
//       roomObject.nextPlayer = roomObject.players[nextPlayerIndex].username

//       const updateDoc = { $set: roomObject }

//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           sendGameInfo(roomId)
//         }
//       })
//     })
//   })

//   socket.on('card movement', function(roomId, username, cardMovement) {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
//       const playerIndex = roomObject.players.findIndex(player => player.name === username)
//       const isCurrentPlayersTurn = roomObject.players[playerIndex].name === roomObject.currentPlayer
//       let card = {}

//       if (cardMovement.from === 'player' && cardMovement.to === 'player' && !isCurrentPlayersTurn) {
//         card = roomObject.players[playerIndex].hand[cardMovement.fromPosition]
//         roomObject.players[playerIndex].hand.splice(cardMovement.fromPosition, 1)
//         roomObject.players[playerIndex].hand.splice(cardMovement.toPosition, 0, card)
//       } else if (isCurrentPlayersTurn) {
//         if (cardMovement.from === 'player') {
//           card = roomObject.players[playerIndex].hand[cardMovement.fromPosition]
//           roomObject.players[playerIndex].hand.splice(cardMovement.fromPosition, 1)
//         } else {
//           const groupId = roomObject.table.findIndex(group => group.id === cardMovement.from)
  
//           card = roomObject.table[groupId].cards[cardMovement.fromPosition]
//           roomObject.table[groupId].cards.splice(cardMovement.fromPosition, 1)
  
//           if (roomObject.table[groupId].cards.length === 0) {
//             roomObject.table.splice(groupId, 1)
//           }
//         }
  
//         if (cardMovement.to === 'player') {
//           roomObject.players[playerIndex].hand.splice(cardMovement.toPosition, 0, card)
//         } else if (cardMovement.to === 'discard') {
//           roomObject.discard.push(card)
  
//           if (roomObject.players[playerIndex].hand.length === 0) {
//             roomObject.currentRoundEnded = true
//             // roomObject.prevPlayer = null
//             roomObject.aPlayerHasBoughtThisTurn = false
//           // } else if (roomObject.players[playerIndex].hand.length === 1) {
//           //   if (roomObject.players[playerIndex].hand[0].id === card.id) {
//           //     roomObject.currentRoundEnded = true
//           //   }
//           } else {
//             const currentTurn = roomObject.rounds[roomObject.rounds.length - 1].currentTurn
//             const nextPlayer = roomObject.players[tools.getNextPlayer(roomObject.players, roomObject.currentPlayer)].name
//             const prevPlayer = roomObject.currentPlayer
          
//             roomObject.prevPlayer = prevPlayer
//             roomObject.currentPlayer = nextPlayer
//             roomObject.currentPlayerHasGrabbedCard = false
//             roomObject.rounds[roomObject.rounds.length - 1].currentTurn = currentTurn + 1
//             roomObject.aPlayerHasBoughtThisTurn = false
//           }
//         } else if (cardMovement.to === 'table') {
//           const newGroup = {
//             id: tools.guidGenerator(),
//             cards: [card]
//           }
      
//           roomObject.table.push(newGroup)
//         } else {
//           const groupId = roomObject.table.findIndex(group => group.id === cardMovement.to)
  
//           roomObject.table[groupId].cards.splice(cardMovement.toPosition, 0, card)
//         }
//       }

//       const updateDoc = { $set: roomObject }

//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           sendGameInfo(roomId)
//         }
//       })
//     })


//   });

//   socket.on('player buys', function(roomId, username) {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
//       // stop if someone already bought on this turn
//       if (roomObject.aPlayerHasBoughtThisTurn) { return false }

//       const playerIndex = roomObject.players.findIndex(player => player.name === username)

//       if (roomObject.rounds[roomObject.rounds.length - 1].currentTurn === 1) {
//         roomObject.hiddenCardsWereBought = true
    
//         for (let card in roomObject.discard) {
//           const newCard = roomObject.discard[card]
//           roomObject.players[playerIndex].hand.push(newCard)
//         }
    
//         roomObject.discard.splice(0, 3)
    
//       } else {
//         // let currentDiscard = currentGameDb.discard.slice()
//         let newCard = roomObject.discard[roomObject.discard.length - 1]
    
//         roomObject.discard.splice(roomObject.discard.length - 1, 1)
//         roomObject.players[playerIndex].hand.push(newCard)
//       }
//       // helper: get cards from stock
//       const getCardsFromStock = (n) => {
//         const cards = roomObject.stock.splice(roomObject.stock.length - n, n)
//         return cards
//       }
         
//       const result = getCardsFromStock(1)
    
//       for (let i in result) {
//         roomObject.players[playerIndex].hand.push(result[i]) 
//       }




//       clearInterval(global.timer)
//       roomObject.playerPausedGame = null
//       roomObject.remainingTime = 0

//       const updateDoc = { $set: roomObject }
//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           sendGameInfo(roomId)
//         }
//       })
//     })
//   })

//   socket.on('player also wants', function (roomId, username) {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {

//       let updateDoc = {}
//       const thisPlayerPriorityIndex = roomObject.playersByPriority.findIndex(player => player === username)

//       updateDoc = {
//         $push: {
//           alsoWants: {
//             $each: [{ name: username, priority: thisPlayerPriorityIndex }],
//             $sort: { priority: 1 }
//           }
//         }
//       }

//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         }
//       })
//     })
//   })

//   socket.on('player cancels pause', function(roomId, username) {
    
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
      
//       clearInterval(global.timer)
//       roomObject.playerPausedGame = null
//       roomObject.remainingTime = 0
      
//       if (roomObject.alsoWants.length > 0) {
//         handlePlayerPause(roomId, roomObject.alsoWants[0].name)
//       }

//       const updateDoc = {
//         $set: { playerPausedGame: null, remainingTime: 0 },
//         $pop: { alsoWants: -1 }
//       }
//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           sendGameInfo(roomId)
//         }
//       })
//     })
//   })

//   const handlePlayerPause = (roomId, username) => {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
//       // stop if someone already bought on this turn
//       if (roomObject.aPlayerHasBoughtThisTurn) { return false }

//       // handle game pause 
//       const pauseCountdown = (pauseTime) => {
//         telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//           name: roomId
//         }).then(roomObject => {
//           // roomObject.remainingTime = roomObject.remainingTime - 1
//           // const remainingTime = roomObject.remainingTime > 0 ? roomObject.remainingTime : roomObject.pauseTime
          
//           let updateDoc = {}

//           if (pauseTime > 0) {
//             updateDoc = {
//               $set: {
//                 remainingTime: pauseTime,
//                 playerPausedGame: username
//               }
//             }
//           } else {
//             updateDoc = {
//               $set: {
//                 remainingTime: roomObject.remainingTime - 1,
//                 playerPausedGame: username
//               }
//             }
//             // Check if we're at zero.
//             if (roomObject.remainingTime === 0) { 
//               clearInterval(global.timer)
//               // roomObject.playerPausedGame = null
//               updateDoc = {
//                 $set: {
//                   remainingTime: 0,
//                   playerPausedGame: null
//                 }
//               }
//             }
//           }

//           telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//             name: roomId
//           }, updateDoc, function(err, doc) {
//             if (err)  {
//               // TODO: hanlde error
//             } else {
//               sendGameInfo(roomId)
//             }
//           })
//         })
//       }
      
//       const startPauseTimer = () => {
//         clearInterval(global.timer)
//         pauseCountdown(roomObject.pauseTime)
//         global.timer = setInterval(pauseCountdown, 1000)
//       }

//       startPauseTimer()

//       const playersByPriority = []
//       const numberOfPlayers = roomObject.players.length
//       playersByPriority.push(roomObject.currentPlayer)
//       currentPlayerIndex = roomObject.players.map(player => player.name === roomObject.currentPlayer)
//       let thisPlayerIndex = tools.getNextPlayer(roomObject.players, roomObject.currentPlayer)

//       for (let i = 0; i < (numberOfPlayers - 1); i++) {
//         playersByPriority.push(roomObject.players[thisPlayerIndex].name)
//         thisPlayerIndex = tools.getNextPlayer(roomObject.players, roomObject.players[thisPlayerIndex].name)
//       }

//       roomObject.playersByPriority = playersByPriority

//       const updateDoc = { $set: { playersByPriority: playersByPriority} }
//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           sendGameInfo(roomId)
//         }
//       })
//     })
//   }

//   socket.on('player pauses', function(roomId, username) {
//     handlePlayerPause(roomId, username)
//   })

//   socket.on('start new round', function(roomId) {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: roomId
//     }).then(roomObject => {
//       for (let i in roomObject.players) {
//         roomObject.players[i].hand = []
//       }
//       roomObject.discard = []
//       roomObject.stock = []
//       roomObject.table = []
//       roomObject.currentRoundEnded = false
//       roomObject.prevPlayer = null
//       roomObject.currentTurn = 0
//       roomObject.currentPlayerHasGrabbedCard = false

//       const updateDoc = { $set: roomObject }

//       telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//         name: roomId
//       }, updateDoc, function(err, doc) {
//         if (err)  {
//           // TODO: hanlde error
//         } else {
//           initNewGame(roomId)
//         }
//       })
//     })
//   })


//   socket.on('disconnect', function() {
//     telefunkenDb.collection(ROOMS_COLLECTION).findOne({
//       name: thisGameId
//     }).then((gameDb) => {

//       const userAlreadyPlaying = () => {
//         for (let i in gameDb.players) {
//           if (gameDb.players[i].socketId === socket.id) {
//             return gameDb.players[i]
//           }
//         }
//       }

//       if (!!userAlreadyPlaying()) {
//         const updatedUser = userAlreadyPlaying()
//         updatedUser.isOnline = false

//         const updateDoc = { $set: { 'players.$[element]': updatedUser } }
//         const arrayFilters = { arrayFilters: [ { 'element.socketId': socket.id } ], upsert: true }

//         telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//           name: thisGameId
//         }, updateDoc, arrayFilters, function(err, doc) {
//           if (err)  {
//             // TODO: hanlde error
//           } else {
//             sendGameInfo(thisGameId)
//           }
//         })
//       } else {
//         const updateDoc = { $pull: { 'connectedUsers': { socketId: socket.id } } }

//         telefunkenDb.collection(ROOMS_COLLECTION).updateOne({
//           name: thisGameId
//         }, updateDoc, function(err, doc) {
//           if (err)  {
//             // TODO: hanlde error
//           } else {
//             sendGameInfo(thisGameId)
//           }
//         })
//       }
//     })
//   })
// })

// http.listen(port, () => console.log(`Listening on port ${port}`))