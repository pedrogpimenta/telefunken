import React from "react"
import Button from './Button'
import RenderCards from './RenderCards'

function Player(props) {
  const isCurrentPlayer = props.currentPlayer === props.user.username

  // const isBuyButtonDisabled = 

  return (
    <div className="relative inline-flex flex-col items-start p-2">

      <div className="mx-2">
        {isCurrentPlayer &&
          <strong>
            {props.user.username}
          </strong>
        }
        {!isCurrentPlayer && props.user.username}
      </div>
      <div>
        <RenderCards
          cards={props.user.hand}
          location='user'
          onClick={props.handleCardClick}
          handleHandUpdate={props.handleHandUpdate}
          sendToServer={(action, content) => props.sendToServer(action, content)}
        />
      </div>
    </div>
  )
}

export default Player
