import React from "react"

function Player(props) {
  return (
    <div>
      {props.user.username} | {props.user.cards} | {props.user.isOnline ? 'online' : 'offline'}
    </div>
  )
}

export default Player
