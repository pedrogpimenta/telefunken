import React from "react"

function PlayingCard(props) {
  const renderSuit = () => {
    switch(props.suit) {
      case 'diamonds':
        return '♦️'
      case 'spades':
        return '♠️'
      case 'clubs':
        return '♣️'
      case 'hearts':
        return '♥️'
      default:
        return null
    }
  }

  const isRedSuit = () => {
    if (props.suit === 'hearts' || props.suit === 'diamonds') {
      return true
    }

    return false
  }

  const isCardHidden = () => {
    if (!props.value || !props.suit) {
      return true
    }

    return false
  }

  const isCardSelected = () => {
    if (props.selected) {
      return true
    }
  }

  const cardColour = isRedSuit() ? 'text-red-600' : 'text-black'
  const cardBorderColour = isCardSelected() ? 'border-red-500 shadow-xl': 'border-gray-400'

  const cardFrontClasses = `inline-flex flex-col flex-shrink-0 items-center justify-around leading-none bg-white border-2 border-solid ${cardBorderColour} ${cardColour} rounded px-2 py-1 -ml-3 w-8 h-12`
  const cardBackClasses = `${cardFrontClasses} bg-gray-300`
  const style = isCardHidden() ? cardBackClasses : cardFrontClasses

  return (
    <div className={style} onClick={(e) => props.onClick(props)}>
      <span>{props.value}</span>
      <span>{renderSuit()}</span>
    </div>
  )
}

export default PlayingCard
