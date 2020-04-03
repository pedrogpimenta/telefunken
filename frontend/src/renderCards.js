import React from "react"
import PlayingCard from './components/PlayingCard'

function renderCards(cards) {
  if (!!cards) {
    return cards.map(card => <PlayingCard key={card.id} value={card.value} suit={card.suit} />)
  }

  return null
}

export default renderCards
