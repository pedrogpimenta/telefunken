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

  return (
    <div className="inline-flex items-center my-2">
      <span>
        {props.user.username}
      </span>
      <span>
        {renderCards(props.user.hand)}
      </span>
    </div>
  )
}

export default Player
