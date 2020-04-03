module.exports = {
  makeDeck: function() {
    const suits = ['spades', 'diamonds', 'clubs', 'hearts'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const deck = [];
    for(var i = 0; i < suits.length; i++) {
      for(var x = 0; x < values.length; x++) {
        var card = {value: values[x], suit: suits[i]};
        deck.push(card);
      }
    }

    return deck;
  },

  getDeck: function(n) {
    const numberOfDecks = n || 1
    const baseDeck = this.makeDeck()
    let newDeck = []
    for (i = 0; i < numberOfDecks; i++) {
      console.log('i:', i)
      baseDeck.forEach((e) => {
        e.id = this.guidGenerator()
        newDeck.push(e)
      })
    }

    const shuffledDeck = this.shuffle(newDeck)

    return shuffledDeck
  },

  shuffle: function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  // Make IDs
  guidGenerator: function() {
    const S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
  }
}
