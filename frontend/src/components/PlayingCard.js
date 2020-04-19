import React from "react"

function PlayingCard(props) {
  // render suit icon
  const renderSuit = () => {
    switch(props.suit) {
      case 'diamonds':
        return (
          <svg width="100%" height="100%" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 0L17 8.5L8.5 17L0 8.5L8.5 0Z" fill="#E53E3E"/>
          </svg>
        )
      case 'spades':
        return (
          <svg width="100%" height="100%" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2288 13.3022C10.3652 13.5716 10.5558 13.8959 10.8 14.2699C11.3749 15.1501 10.7434 16.317 9.69198 16.317H7.31031C6.29182 16.317 5.65505 15.2147 6.16386 14.3324C6.40604 13.9124 6.59219 13.5722 6.71895 13.3208C6.24182 13.4922 5.72532 13.5849 5.19085 13.5849C2.89057 13.5849 1 11.8785 1 9.73787C1 8.23452 1.85878 7.09699 5.10256 3.62842C5.7399 2.94693 6.70289 1.81697 7.9867 0.243406C8.25594 -0.0866065 8.7623 -0.0800115 9.02286 0.256901C10.1904 1.76659 11.1118 2.89432 11.7834 3.63641C11.8775 3.74046 11.9763 3.84908 12.0858 3.9692C14.0108 6.08034 14.1154 6.19777 14.6922 6.94535C15.5343 8.0368 15.981 8.90103 15.9983 9.69022C15.9994 9.70596 16 9.72185 16 9.73787C16 11.8784 14.1084 13.5849 11.808 13.5849C11.2545 13.5849 10.7201 13.4854 10.2288 13.3022Z" fill="black"/>
          </svg>
        )
      case 'clubs':
        return (
          <svg width="100%" height="100%" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75337 15.476V15.4642C10.3026 15.3844 10.7244 14.9116 10.7244 14.3403C10.7244 14.1802 10.6905 14.0218 10.625 13.8757C10.3273 13.2118 10.1014 12.6855 9.95223 12.3134C11.1403 13.1278 12.7381 13.2416 14.0687 12.4733C15.9155 11.4071 16.5483 9.0456 15.4821 7.19881C14.8156 6.04441 13.6254 5.34577 12.3558 5.27348C12.4754 4.15285 12.1057 2.98988 11.2468 2.13092C9.73888 0.623026 7.2941 0.623026 5.7862 2.13092C4.92768 2.98944 4.55796 4.15166 4.67703 5.27176C3.39514 5.33378 2.19018 6.03447 1.51795 7.19881C0.451704 9.0456 1.08446 11.4071 2.93125 12.4733C4.26189 13.2416 5.85973 13.1278 7.04777 12.3134C6.89859 12.6855 6.67265 13.2118 6.37499 13.8757C6.30946 14.0218 6.27559 14.1802 6.27559 14.3403C6.27559 14.9116 6.69744 15.3844 7.24663 15.4642V15.476H7.4065L7.41125 15.476H9.58875L9.5935 15.476H9.75337Z" fill="black"/>
          </svg>
        )
      case 'hearts':
        return (
          <svg width="100%" height="100%" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.9563 16.8158C8.70087 17.0611 8.29901 17.0614 8.04322 16.8165C3.35957 12.3315 1 8.84008 1 6.21661C1 3.88784 2.87631 2 5.19085 2C6.51512 2 7.72256 2.62375 8.49894 3.62675C9.27573 2.62379 10.4837 2 11.808 2C14.1227 2 16 3.888 16 6.21661C15.9727 8.86592 13.6139 12.3427 8.9563 16.8158Z" fill="#E53E3E"/>
          </svg>
        )
      default:
        return null
    }
  }

  let stockClassesUngrabbed = ''
  if (!!props.showUngrabbed) {
    stockClassesUngrabbed = props.showUngrabbed() ? 'inset 0px 0px 0px 3px red' : 'inset 0px 0px 0px 3px #cbd5e0'
  }

  // render red color on hearts and diamons
  const isRedSuit = () => props.suit === 'hearts' || props.suit === 'diamonds'
  const cardColour = isRedSuit() ? 'text-red-600' : 'text-black'

  // card is facing back
  const isCardHidden = () => !props.value || !props.suit
  console.log('card hidden:', isCardHidden())

  const text = 'text-xl tracking-tighter'
  const cardBorderColour = 'border-gray-400'
  const sizeBg = 'w-12 md:w-16 h-16 md:h-20'
  const sizeSm = 'w-12 h-16'
  const spacings = 'px-2 py-1 mx-2 my-2'

  // const baseCard = `relative overflow-hidden select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-start leading-none rounded border-2 border-solid ${cardBorderColour} ${cardColour}`
  const baseCard = `relative overflow-hidden select-none cursor-default inline-flex flex-col flex-shrink-0 items-center justify-start leading-none rounded ${cardColour}`

  // TODO: style jungle
  const cardDefaultClasses = `${baseCard} ${sizeBg} ${spacings} ${text} bg-white`

  const cardBackClasses = `${baseCard} ${sizeBg} ${spacings} ${text} bg-gray-300`

  const cardClasses = isCardHidden() ? cardBackClasses : cardDefaultClasses

  const otherPlayerClasses = `${baseCard} ${sizeSm} ${spacings} ${text} -ml-10 justify-center bg-gray-300`

  const stockClasses = `${baseCard} ${sizeSm} ${stockClassesUngrabbed} px-2 py-1 mx-2 justify-center bg-gray-300 text-gray-700 text-l tracking-tight`

  const cardDiscardClasses = `${baseCard} ${sizeSm} ${spacings} ${text} bg-white`
  const cardDiscardBackClasses = `${cardDiscardClasses} bg-gray-300`

  const renderCard = () => {
    if (props.type === 'other players') {
      return (
        <div
          className={otherPlayerClasses}
          style={{
            boxShadow: 'inset 0px 0px 0px 3px #cbd5e0'
          }}
        >
          <span className="inline-flex font-bold">{props.value}</span>
        </div>
      ) 
    } else if (props.type === 'discard') {
      // TODO: move this logic
      let thisClasses = ''
      if (!props.value || !props.suit) {
        thisClasses = `${cardDiscardBackClasses}`
      } else {
        thisClasses = `${cardDiscardClasses}`
      }
      return (
        <div
          className={thisClasses}
          style={{
            boxShadow: 'inset 0px 0px 0px 3px #cbd5e0'
          }}
        >
          <span className="font-bold" style={{
            marginLeft: '-1.45rem',
          }}>{props.value}</span>
            <span style={{
              width: '1rem',
              height: '1rem',
              marginLeft: '-1.4rem',
              marginTop: '.1rem'
            }}>{renderSuit()}</span>
            <span style={{
              position: 'absolute',
              width: '2.5rem',
              height: '2.5rem',
              bottom: '-.7rem',
              right: '-.7rem'
            }}>{renderSuit()}</span>
        </div>
      ) 
    } else if (props.type === 'stock') {
      return (
        <div
          className={stockClasses}
          style={{
            boxShadow: stockClassesUngrabbed
          }}
          onClick={(e) => props.onClick(props)}
        >
          <span className="inline-flex font-bold">{props.value}</span>
        </div>
      ) 
    } else {
      return (
        <div className="inline-block">
          <div
            className={cardClasses}
            style={{
              boxShadow: 'inset 0px 0px 0px 3px #cbd5e0'
            }}
          >
            <span
              className="font-bold"
              style={{
                marginLeft: '-80%',
                letterSpacing: '-0.1em'
              }}>{props.value}</span>
            <span style={{
              width: '1rem',
              height: '1rem',
              marginLeft: '-77%',
              marginTop: '.1rem'
            }}>{renderSuit()}</span>
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bottom: '-25%',
              right: '-25%'
            }}>{renderSuit()}</span>
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
