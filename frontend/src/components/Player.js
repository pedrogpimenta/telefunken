import React from "react"
import RenderCards from './RenderCards'

function Player(props) {
  const renderOnline = () => {
    const userPlayerUsername = localStorage.getItem('username')

    if (props.user.username !== userPlayerUsername) {
      return (
        <span>
          <span>{props.user.isOnline ? 'online' : 'offline'}</span>
        </span>
      )
    }
  }

  const isCurrentPlayer = props.currentPlayer === props.user.username
  const isPlayerOnline = !!props.user.isOnline
  const onlineClasses = "inline-flex flex-col items-start py-2"
  const offlineClasses = `${onlineClasses} opacity-100`
  const styles = isPlayerOnline ? onlineClasses : offlineClasses

  return (
    <div className={styles}>
      <span className="mx-2">
        {isCurrentPlayer &&
          <strong>
            {props.user.username}
          </strong>
        }
        {!isCurrentPlayer && props.user.username}
      </span>
      <span>
        <RenderCards
          cards={props.user.hand}
          location='user'
          onClick={props.handleCardClick}
          handleHandUpdate={props.handleHandUpdate}
        />
      </span>
    </div>
  )
}

export default Player
