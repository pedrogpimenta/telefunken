const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const fs = require('fs')

// our localhost port
const port = 4001





// my shitz
function Deck() {
  const suits = ['spades', 'diamonds', 'clubs', 'hearts'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const deck = [];
  for(var i = 0; i < suits.length; i++) {
    for(var x = 0; x < values.length; x++) {
    	var card = {Value: values[x], Suit: suits[i]};
    	deck.push(card);
    }
  }

  return deck;
}







// Set inital clients array
let connectedClients = [];

// Set namespace 'game'
const game = io.of('/game')


// On Init connection to game
game.on('connection', function(socket) {
  let thisGameId = socket.handshake.query.gameId
  console.log('a user connected to:', thisGameId)

  // Create empty room in DB if it doesn't exist
  if (!fs.existsSync('db/' + thisGameId + '.js')) {
    fs.writeFileSync('db/' + thisGameId + '.js', JSON.stringify({ connectedClients: [] }), (err) => {})
  }

  // Create room array and populate
  let thisDb
  thisDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))

  // Log all connected clients to socket
  const socketClients = io.sockets.sockets

  // Join specific room
  socket.join(thisGameId)

  socket.on('login', function(gameId, username){
    thisDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))

    // Check if user exists in array
    const doesUserExist = () => {
      let userExists = false
      for (i in thisDb.connectedClients) {
        if (thisDb.connectedClients[i].username === username) {
          userExists = i 
        }
      }
      return userExists
    }

    // Add or Update user
    if (thisDb.connectedClients.length > 0) {
      // Update user if found
      if (doesUserExist()) {
        thisDb.connectedClients[doesUserExist()].socketId = socket.id
        thisDb.connectedClients[doesUserExist()].isOnline = true
      } else {
        // Add user if not found
        thisDb.connectedClients.push({
          'socketId': socket.id,
          'id': connectedClients.length + 1,
          'gameId': gameId,
          'username': username,
          'cards': 0,
          'isOnline': true
        })
      }
    } else {
      // Add user if none exists
      thisDb.connectedClients.push({
        'socketId': socket.id,
        'id': connectedClients.length + 1,
        'gameId': gameId,
        'username': username,
        'cards': 0,
        'isOnline': true
      })
    }

    // Write users to db
    fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(thisDb), (err) => {})

    // Update User Cards
    const getUserCards = () => {
      for (var i in thisDb.connectedClients) {
        if (thisDb.connectedClients[i].username === username) {
          return thisDb.connectedClients[i].cards
        }
      }
    }
    const userCards = getUserCards()

    // Send saved user info
    game.to(gameId).emit('updateUserInfo', {username: username, socketId: socket.id, userCards: userCards})
    // Send connected users info
    game.to(gameId).emit('connectedUsers', thisDb.connectedClients)
  })

  // Hanlde Card Add Button
  socket.on('handleCardAddButton', function(gameId, user){
    thisDb = JSON.parse(fs.readFileSync('db/' + thisGameId + '.js', 'utf8'))
    for (var item in thisDb.connectedClients) {
      if (thisDb.connectedClients[item].username === user.username) {
        thisDb.connectedClients[item].cards += 1
      }
    }
    fs.writeFileSync('db/' + gameId + '.js', JSON.stringify(thisDb), (err) => {})

    socket.broadcast.to(gameId).emit('connectedUsers', thisDb.connectedClients)
    
  })

  socket.on('disconnect', function(gameId){
    console.log('user disconnected')

    const doesUserExist = () => {
      let userExists = false
      for (i in thisDb.connectedClients) {
        if (thisDb.connectedClients[i].socketId === socket.id) {
          userExists = i 
        }
      }
      return userExists
    }

    // Set user as offline
    if (doesUserExist()) {
      thisDb.connectedClients[doesUserExist()].isOnline = false
    }

    //fs.writeFileSync('db/' + thisGameId + '.js', JSON.stringify(thisDb), (err) => {})
    game.to(thisGameId).emit('connectedUsers', thisDb.connectedClients)

  })

})



http.listen(port, () => console.log(`Listening on port ${port}`))
