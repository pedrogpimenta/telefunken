import React from "react"
import Button from './Button'
import RenderCards from './RenderCards'

function Player(props) {
  const isCurrentPlayer = props.currentPlayer === props.user.username

  const userIndex = props.room.players.findIndex(player => player.name === props.user.username)
  const userHand = props.room.players[userIndex].hand
  const userBuys = props.room.players[userIndex].buys

  return (
    <div className="relative inline-flex flex-col items-start w-full p-2">
      <div className="mx-2">
        {isCurrentPlayer &&
          <strong>
            {props.user.username} ({userBuys})
          </strong>
        }
        {!isCurrentPlayer &&
          <div>
            {props.user.username} ({userBuys})
          </div>
        }
      </div>
      <div className="w-full">
        <RenderCards
          cards={userHand}
          location='user'
          handleCardDrop={(location, e) => props.handleCardDrop(location, e)}
          onClick={props.handleCardClick}
          sendToServer={(action, content) => props.sendToServer(action, content)}
        />
      </div>
    </div>
  )
}

export default Player
