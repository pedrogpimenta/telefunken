import React from "react"

function PlayingCard(props) {
  // render suit icon
  const renderSuit = () => {
    switch(props.suit) {
      case 'diamonds':
        return (
          <svg className="fill-current text-red-600" width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M52.8046 1.38349C64.8036 16.9009 83.0996 35.1968 98.6169 47.1961C100.461 48.6221 100.461 51.3779 98.6169 52.8039C83.0996 64.8032 64.8036 83.0987 52.8046 98.6165C51.3784 100.461 48.6212 100.461 47.1954 98.6165C35.1964 83.0991 16.9004 64.8032 1.38308 52.8039C-0.461027 51.3779 -0.461027 48.6221 1.38308 47.1961C16.9 35.1968 35.1959 16.9009 47.195 1.38349C48.6212 -0.461163 51.3779 -0.461163 52.8046 1.38349Z"/>
          </svg>
        )
      case 'spades':
        return (
          <svg className="fill-current text-gray-900" width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M52.3122 0.513139C51.1919 -0.171046 49.8073 -0.171046 48.6874 0.513139C40.1088 5.75236 4 29.4189 4 56.5892C4 70.7107 15.417 82.1582 29.5001 82.1582C34.1099 82.1582 38.4299 80.9286 42.1583 78.7814C43.2272 78.1655 44.4773 79.2539 44.0578 80.4236C42.0685 85.9708 39.252 91.1169 35.7544 95.7059C34.4187 97.4587 35.7015 100 37.8896 100H63.3804C65.5693 100 66.8493 97.4575 65.5127 95.7039C62.0548 91.1667 59.2633 86.0857 57.2785 80.6106C56.8569 79.4477 58.0892 78.3573 59.1618 78.9553C62.8162 80.9933 67.0202 82.1582 71.4999 82.1582C85.5834 82.1582 97 70.7107 97 56.5892C97 29.4189 60.8912 5.75236 52.3122 0.513139Z"/>
          </svg>

        )
      case 'clubs':
        return (
          <svg className="fill-current text-gray-900" width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M80.2678 40.3586C71.5984 39.8611 64.0103 44.6427 60.3705 51.7781C59.5671 53.3537 58.2275 54.5913 56.5486 55.1464C56.5277 55.1532 56.5069 55.1604 56.486 55.1668C55.0586 55.6372 53.632 54.4204 53.8559 52.9336C54.3476 49.6682 55.1198 46.4948 56.1439 43.4355C56.6999 41.7747 57.9158 40.4411 59.4778 39.6485C66.6332 36.0165 71.4312 28.4176 70.9332 19.7338C70.3241 9.11776 61.4925 0.445757 50.8682 0.0175263C38.8931 -0.465536 29.0332 9.09963 29.0332 20.9673C29.0332 29.1426 33.7212 36.2068 40.5494 39.6612C42.0973 40.4443 43.2987 41.7684 43.8502 43.4133C44.8775 46.4794 45.6528 49.6605 46.1459 52.9336C46.3693 54.42 44.9432 55.6372 43.5157 55.1668C43.4944 55.16 43.4727 55.1527 43.4514 55.1455C41.7738 54.5904 40.4352 53.3537 39.6322 51.7795C35.9933 44.6432 28.4047 39.8606 19.734 40.3582C9.11783 40.9672 0.445729 49.7987 0.0174943 60.4229C-0.46512 72.398 9.10016 82.2577 20.9675 82.2577C29.1166 82.2577 36.161 77.6002 39.6276 70.8087C40.4343 69.2286 41.7792 67.9879 43.4632 67.4309C43.4827 67.4246 43.5021 67.4178 43.5216 67.4115C44.95 66.9411 46.3724 68.1592 46.1518 69.6464C44.6713 79.6072 40.5883 88.7169 34.6166 96.2669C33.4221 97.7773 34.5282 100 36.4542 100H63.5458C65.4717 100 66.5779 97.7773 65.3834 96.2669C59.4116 88.7169 55.3287 79.6072 53.8482 69.6464C53.6271 68.1587 55.0495 66.9411 56.4783 67.4115C56.4978 67.4178 56.5173 67.4246 56.5368 67.4309C58.2212 67.9879 59.5657 69.229 60.3723 70.8087C63.839 77.6006 70.8833 82.2577 79.0325 82.2577C90.9007 82.2577 100.466 72.3975 99.9825 60.4229C99.556 49.7992 90.8839 40.9677 80.2678 40.3586Z"/>
          </svg>
        )
      case 'hearts':
        return (
          <svg className="fill-current text-red-600" width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 32.6846C0 17.3947 12.2762 5 27.4195 5C34.9253 5 41.7209 8.04914 46.6695 12.9844C48.5048 14.814 51.4956 14.814 53.3305 12.9844C58.2795 8.04958 65.0751 5 72.5805 5C87.7238 5 100 17.3947 100 32.6846C100 61.2773 63.3226 87.2888 52.7941 94.1661C51.0922 95.278 48.9074 95.278 47.2055 94.1661C36.6778 87.2888 0 61.2777 0 32.6846Z"/>
          </svg>    

        )
      default:
        return null
    }
  }

  let stockClassesUngrabbed = ''
  if (!!props.showUngrabbed) {
    stockClassesUngrabbed = props.showUngrabbed() ? 'inset 0px 0px 0px 3px #e53e3e' : 'inset 0px 0px 0px 3px #cbd5e0'
  }

  // render red color on hearts and diamons
  const isRedSuit = () => props.suit === 'hearts' || props.suit === 'diamonds'
  const cardColour = isRedSuit() ? 'text-red-600' : 'text-black'

  // card is facing back
  const isCardHidden = () => !props.value || !props.suit

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

  const otherPlayerClasses = `${baseCard} ${sizeSm} ${spacings} ${text} justify-center bg-gray-300`

  const stockClasses = `${baseCard} ${sizeSm} ${stockClassesUngrabbed} px-2 py-1 mx-2 justify-center bg-gray-300 text-gray-700 text-l tracking-tight`

  const cardDiscardClasses = `${baseCard} ${sizeSm} ${spacings} ${text} bg-white`
  const cardDiscardBackClasses = `${cardDiscardClasses} bg-gray-300`

  const renderCard = () => {
    if (props.type === 'other players') {
      const classes = props.showCardValue ? `${baseCard} ${sizeSm} ${spacings} ${text} bg-white` : otherPlayerClasses
      return (
        <div
          className={classes}
          style={{
            boxShadow: 'inset 0px 0px 0px 3px #cbd5e0'
          }}
        >
          {props.showCardValue &&
            <span
              className="text-l font-bold"
              style={{
                marginLeft: '-80%',
                letterSpacing: '-0.1em'
              }}>{props.value}</span>
          }
          {props.showCardValue &&
            <span style={{
              width: '1rem',
              height: '1rem',
              marginLeft: '-77%',
              marginTop: '.1rem'
            }}>{renderSuit()}</span>
          }
          {props.showCardValue &&
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              bottom: '-35%',
              right: '-45%'
            }}>{renderSuit()}</span>
          }
          {!props.showCardValue &&
            <span className="inline-flex font-bold">{props.value}</span>
          }
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
              width: '100%',
              height: '100%',
              bottom: '-35%',
              right: '-45%'
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
              bottom: '-35%',
              right: '-35%'
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
