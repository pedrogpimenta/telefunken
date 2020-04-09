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

  const cardDefaultClasses = `inline-flex flex-col flex-shrink-0 items-center justify-start leading-none bg-white border-2 border-solid ${cardBorderColour} ${cardColour} rounded px-2 py-1 mx-2 my-2 w-16 h-20 text-xl tracking-tighter`

  const cardBackClasses = `${cardDefaultClasses} bg-gray-300`
  const cardClasses = isCardHidden() ? cardBackClasses : cardDefaultClasses

  const otherPlayerClasses = `inline-flex flex-col flex-shrink-0 items-center justify-center leading-none bg-gray-300 border-2 border-solid ${cardBorderColour} text-gray-700 rounded px-2 py-1 -ml-10 w-12 h-16 text-3xl tracking-tighter`

  const stockClasses = `inline-flex flex-col flex-shrink-0 items-center justify-center leading-none bg-gray-300 border-2 border-solid ${cardBorderColour} text-gray-700 rounded px-2 py-1 w-12 h-16 text-3xl tracking-tighter`

  const cardDiscardClasses = `inline-flex flex-col flex-shrink-0 items-center justify-start leading-none bg-white border-2 border-solid ${cardBorderColour} ${cardColour} rounded px-2 py-1 mx-2 my-2 w-12 h-16 text-xl tracking-tighter`
  const cardDiscardBackClasses = `${cardDiscardClasses} bg-gray-300`

  const renderCard = () => {
    if (props.type === 'other players') {
      return (
        <div className={otherPlayerClasses} onClick={(e) => props.onClick(props)}>
          <span className="inline-flex font-bold">{props.value}</span>
        </div>
      ) 
    } else if (props.type === 'discard') {
      let thisClasses = ''
      if (!props.value || !props.suit) {
        thisClasses = `${cardDiscardBackClasses}`
      } else {
        thisClasses = `${cardDiscardClasses} -ml-16`
      }
      return (
        <div className={thisClasses} onClick={(e) => props.onClick(props)}>
          <span className="font-bold" style={{marginLeft: '-1.4rem'}}>{props.value}</span>
          <span style={{marginLeft: '-1.4rem'}}>{renderSuit()}</span>
        </div>
      ) 
    } else if (props.type === 'stock') {
      return (
        <div className={stockClasses} onClick={(e) => props.onClick(props)}>
          <span className="inline-flex font-bold">{props.value}</span>
        </div>
      ) 
    } else {
      return (
        <div className="inline-block">
          <div className={cardClasses} onClick={(e) => props.onClick(props)}>
            <span className="font-bold" style={{marginLeft: '-2.4rem'}}>{props.value}</span>
            <span style={{marginLeft: '-2.4rem'}}>{renderSuit()}</span>
          </div>
        </div>
      ) 
    }
  }

  return (
    renderCard()
  )
}

export default PlayingCard
