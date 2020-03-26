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







io.on('connection', function(socket){
  console.log('a user connected');

  console.log(socket.id);

  socket.on('test', function(msg){
    console.log(msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(port, () => console.log(`Listening on port ${port}`))
