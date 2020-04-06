import React from "react"
import renderCards from '../renderCards'

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
  const onlineClasses = "inline-flex items-center my-2"
  const offlineClasses = `${onlineClasses} opacity-75`
  const styles = isPlayerOnline ? onlineClasses : offlineClasses

  return (
    <div className={styles}>
      <span>
        {isCurrentPlayer &&
          <strong>
            {props.user.username}
          </strong>
        }
        {!isCurrentPlayer && props.user.username}
      </span>
      <span>
        {renderCards(props.user.hand, 'user', props.handleCardClick)}
      </span>
    </div>
  )
}

export default Player
