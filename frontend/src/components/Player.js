import React from "react"

function Player(props) {
  return (
    <div>
      {props.username} | {props.cards}
    </div>
  )
}

export default Player
