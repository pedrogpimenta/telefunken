import React from "react"
import PlayingCard from './components/PlayingCard'

function renderCards(cards, type, handleCardClick) {
  const handleRegularCardClick = () => {
  }

  const handleStockCardClick = (e) => {
    console.log('click stock:', e)
    handleCardClick('stock', e)
  }

  const handleUserCardClick = (e) => {
    console.log('click user:', e)
    handleCardClick('user', e)
  }

  switch(type) {
    case 'discard':
      if (!!cards) {
        return cards.map(card => <PlayingCard
          key={card.id}
          id={card.id}
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
    case 'other players':
      return cards.map((card, i) => <PlayingCard
        key={card.id}
        id={card.id}
        value={card.value}
        suit={card.suit}
        styles={{marginLeft: -16 + 'px'}}
        onClick={(e) => null}
      />)
    default:
      if (!!cards) {
        return cards.map(card => <PlayingCard
          key={card.id}
          id={card.id}
          value={card.value}
          suit={card.suit}
          selected={card.selected}
          onClick={(e) => handleUserCardClick(e)}
        />)
      }
      return null
  }

}

export default renderCards
