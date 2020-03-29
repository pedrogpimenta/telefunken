import React from "react"

function Player(props) {
  return (
    <div>
      {props.user.username} | {props.user.cards}
    </div>
  )
}

export default Player
