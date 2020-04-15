import React from "react"

function PlayingCard(props) {
  // render suit icon
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

  // render red color on hearts and diamons
  const isRedSuit = () => props.suit === 'hearts' || props.suit === 'diamonds'

  // card is facing back
  const isCardHidden = () => !props.value || !props.suit

  // TODO: style jungle
  const cardColour = isRedSuit() ? 'text-red-600' : 'text-black'
  const cardBorderColour = 'border-gray-400'

  const cardDefaultClasses = `select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-start leading-none bg-white border-2 border-solid ${cardBorderColour} ${cardColour} rounded px-2 py-1 mx-2 my-2 w-16 h-20 text-xl tracking-tighter`

  const cardBackClasses = `${cardDefaultClasses} bg-gray-300`
  const cardClasses = isCardHidden() ? cardBackClasses : cardDefaultClasses

  const otherPlayerClasses = `select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-center leading-none bg-gray-300 border-2 border-solid ${cardBorderColour} text-gray-700 rounded px-2 py-1 -ml-10 w-12 h-16 text-3xl tracking-tighter`

  const stockClasses = `select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-center leading-none bg-gray-300 border-2 border-solid ${cardBorderColour} text-gray-700 rounded px-2 py-1 w-12 h-16 text-l tracking-tight`

  const cardDiscardClasses = `select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-start leading-none bg-white border-2 border-solid ${cardBorderColour} ${cardColour} rounded px-2 py-1 mx-2 my-2 w-12 h-16 text-xl tracking-tighter`
  const cardDiscardBackClasses = `${cardDiscardClasses} bg-gray-300`

  const renderCard = () => {
    if (props.type === 'other players') {
      return (
        <div className={otherPlayerClasses}>
          <span className="inline-flex font-bold">{props.value}</span>
        </div>
      ) 
    } else if (props.type === 'discard') {
      // TODO: move this logic
      let thisClasses = ''
      if (!props.value || !props.suit) {
        thisClasses = `${cardDiscardBackClasses}`
      } else {
        thisClasses = `${cardDiscardClasses} -ml-16`
      }
      return (
        <div className={thisClasses}>
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
          <div className={cardClasses}>
            <span className="font-bold" style={{marginLeft: '-2.4rem'}}>{props.value}</span>
            <span style={{marginLeft: '-2.4rem'}}>{renderSuit()}</span>
          </div>
        </div>
      ) 
    }
  }

  return (
    // TODO: dis stoopid
    renderCard()
  )
}

export default PlayingCard
