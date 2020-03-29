const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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




let connectedClients = [];



const broche = io.of('/game/broche')
broche.on('connection', function(socket) {
  console.log('a user connected to broche')
  const socketClients = io.sockets.sockets
  console.log('socketClients:', Object.keys(socketClients).length)

  socket.on('login', function(username){
    const doesUserExist = () => {
      let userExists = false
      for (i in connectedClients) {
        if (connectedClients[i].username === username) {
          userExists = i 
        }
      }
      return userExists
    }

    const getUserCards = () => {
      for (var i in connectedClients) {
        if (connectedClients[i].username === username) {
          return connectedClients[i].cards
        }
      }
    }

    if (doesUserExist()) {
      console.log('user exists:', socket.id)
      connectedClients[doesUserExist()].socketId = socket.id
      connectedClients[doesUserExist()].isOnline = true
    } else {
      connectedClients.push({
        'socketId': socket.id,
        'id': connectedClients.length + 1,
        'username': username,
        'cards': 0,
        'isOnline': true
      })
    }

    socket.emit('updateUserCards', getUserCards())
    socket.broadcast.emit('connectedUsers', connectedClients)
    socket.emit('connectedUsers', connectedClients)
  })

  socket.on('handleCardAddButton', function(user){
    console.log('thisUser:', user)
    console.log('thisUserUsername:', user.username)

    for (var item in connectedClients) {
      if (connectedClients[item].username === user.username) {
        connectedClients[item].cards += 1
      }
    }

    console.log('connectedClients:', connectedClients)

    socket.broadcast.emit('connectedUsers', connectedClients)
    
  })

  socket.on('disconnect', function(){
    console.log('user disconnected')
    const doesUserExist = () => {
      let userExists = false
      for (i in connectedClients) {
        if (connectedClients[i].socketId === socket.id) {
          userExists = i 
        }
      }
      return userExists
    }

    if (doesUserExist()) {
      connectedClients[doesUserExist()].isOnline = false
    }
    console.log('room socketid:', socket.id)
    socket.broadcast.emit('connectedUsers', connectedClients)

  })

})




io.on('connection', function(socket){
  const date = new Date()
  const dateFormat = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  console.log(dateFormat, 'a user connected')

  const socketClients = io.sockets.sockets
  console.log('socketClients:', Object.keys(socketClients).length)

  socket.on('username', function(username){
    const doesUserExist = () => {
      let userExists = false
      for (i in connectedClients) {
        if (connectedClients[i].username === username) {
          userExists = true
        }
      }
      return userExists
    }

    const getUserCards = () => {
      for (var i in connectedClients) {
        if (connectedClients[i].username === username) {
          return connectedClients[i].cards
        }
      }
    }

    if (!doesUserExist()) {
      connectedClients.push({
        'socketId': socket.id,
        'id': connectedClients.length + 1,
        'username': username,
        'cards': 0
      })
    }

    console.log('username:', username)
    console.log('user cards:', getUserCards())

    socket.emit('updateUserCards', getUserCards())
    socket.emit('connectedUsers', connectedClients)
  })

  socket.on('handleCardAddButton', function(user){
    console.log('thisUser:', user)
    console.log('thisUserUsername:', user.username)

    for (var item in connectedClients) {
      if (connectedClients[item].username === user.username) {
        connectedClients[item].cards += 1
      }
    }

    console.log('connectedClients:', connectedClients)

    socket.broadcast.emit('connectedUsers', connectedClients)
    
  })

  socket.on('disconnect', function(){
    console.log('user disconnected')

    console.log('socket.id:', socket.id)


    //const doesUserExist = () => {
    //  let username = false
    //  for (i in connectedClients) {
    //    if (connectedClients[i].username === username) {
    //      userIndex = i
    //    }
    //  }
    //  return userIndex
    //}
    //if (doesUserExist()) {
    //
    //}

  })
})

http.listen(port, () => console.log(`Listening on port ${port}`))
