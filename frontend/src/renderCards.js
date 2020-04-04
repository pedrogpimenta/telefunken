import React from "react"
import PlayingCard from './components/PlayingCard'

function renderCards(cards, type, handleCardClick) {
  const handleRegularCardClick = () => {
  }

  const handleStockCardClick = (e) => {
    handleCardClick(e)
  }

  switch(type) {
    case 'discard':
      if (!!cards) {
        return cards.map(card => <PlayingCard
          key={card.id}
          value={card.value}
          suit={card.suit}
          onClick={(e) => console.log('discard card')}
        />)
      }
      return null
    case 'stock':
      return <PlayingCard
          value={cards}
          onClick={(e) => handleStockCardClick(e)}
        />
    default:
      if (!!cards) {
        return cards.map(card => <PlayingCard
          key={card.id}
          value={card.value}
          suit={card.suit}
          onClick={(e) => console.log('user card')}
        />)
      }
      return null
  }

}

export default renderCards
