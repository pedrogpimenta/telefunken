import React from "react"

function PlayingCard(props) {
  const isCardValueHidden = () => {
    if (!props.value) {
      return true
    }

    return false
  }

  const isRedSuit = () => {
    console.log('suit:', props.suit)
    if (props.suit === 'hearts' || props.suit === 'diamonds') {
      console.log('suit2:', props.suit)
      return true
    }

    return false
  }

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
    }

    return null
  }

  const cardColour = isRedSuit() ? 'text-red-600' : 'text-black'

  const cardFrontStyles = `inline-flex flex-col items-center justify-around leading-none border-2 border-solid border-gray-400 ${cardColour} rounded px-2 py-1 mx-1 w-8 h-12`
  const cardBackStyles = `${cardFrontStyles} bg-gray-300`
  const classes = isCardValueHidden() ? cardBackStyles : cardFrontStyles

  return (
    <span className={classes}>
      <span>{props.value}</span>
      <span>{renderSuit()}</span>
    </span>
  )
}

export default PlayingCard
