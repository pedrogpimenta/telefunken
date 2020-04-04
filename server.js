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







// data model for game database
const NOTFORUSE_gameDb = {
  gameId: '',
  deck: [], // initial cards
  stock: [], // remaining cards for play
  discard: [],
  totalRounds: 6,
  currentRound: 0,
  currentPlayer: '',
  direction: '', // clockwise/counterclockwise
  table: [], // stores array of cards on table
  players: [ // keeps track of players and events
    {
      id: '',
      socketId: '',
      username: '',
      hand: [],
      buys: 6,
      totalPoints: 0,
      isOnline: true,
      events: [
        {
          roundNumber: 1, // number of the round
          buys: 0, // how many buys in this round
          points: 0 // if 0, player cut in this round
        }
      ]
    }
  ]
}

const initNewGame = function(gameId) {
  let thisGameDb = dbTools.getGameDb(gameId)
  
  // assign first player

  // set game deck and stock
  dbTools.setGameDb(gameId, {stock: tools.getDeck(2)})
  thisGameDb = dbTools.getGameDb(gameId)

  // put 3 cards on discard pile
  const result = dbTools.getCardsFromStock(gameId, 3)
  dbTools.setGameDb(gameId, {
    stock: result.newStock,
    discard: result.cards
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

// HELPER: send user info to all users
const sendEachUserInfo = function(gameId, gameDb, username) {
  for (i in gameDb.players) {
    game.to(gameDb.players[i].socketId).emit('updateUserInfo', gameDb.players[i])
  }
}

const sendGameInfo = function(gameId, gameDb) {
  let thisGamePublicDb = gameDb

  if (thisGamePublicDb.discard.length > 0) {
    thisGamePublicDb.discard[0].value = ''
    thisGamePublicDb.discard[0].suit = ''
    thisGamePublicDb.discard[1].value = ''
    thisGamePublicDb.discard[1].suit = ''
  }
  for (i in thisGamePublicDb.players) {
    thisGamePublicDb.players[i].hand = []
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
    dbTools.setGameDb(thisGameId, {player: {username: username, socketId: socket.id}})
    thisGameDb = dbTools.getGameDb(thisGameId)

    // Send saved user info
    for (i in thisGameDb.players) {
      if (thisGameDb.players[i].username === username) {
        game.to(thisGameId).emit('updateUserInfo', thisGameDb.players[i])
      }
    }

    // Send connected users info
    //console.log('thisGameDb.players:', thisGameDb.players)
    sendGameInfo(gameId, thisGameDb)
  })




  // start game
  socket.on('start game', function(gameId, username) {
    //thisGameDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))
    initNewGame(thisGameId)

    let thisGameDb = dbTools.getGameDb(gameId)

    sendEachUserInfo(gameId, thisGameDb)
    sendGameInfo(gameId, thisGameDb)
  })




















  socket.on('disconnect', function() {
    thisGameDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))

    const doesUserExist = () => {
      let userExists = false
      for (i in thisGameDb.connectedClients) {
        if (thisGameDb.connectedClients[i].socketId === socket.id) {
          userExists = i 
        }
      }
      return userExists
    }

    // Set user as offline
    if (doesUserExist()) {
      thisGameDb.connectedClients[doesUserExist()].isOnline = false
    }

    fs.writeFileSync('db/' + thisGameId + '.js', JSON.stringify(thisGameDb), (err) => {})

  })

})



http.listen(port, () => console.log(`Listening on port ${port}`))
