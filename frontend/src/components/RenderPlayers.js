import React, { Component } from 'react'
import { connect } from 'react-redux'
import RenderCards from './RenderCards'

class RenderPlayers extends Component {
  render() {
    const isCurrentPlayer = (playerUsername) => {
      return this.props.room.currentPlayer === playerUsername
    }

    return this.props.room.players.map(player => {
      const isPlayerOnline = player.isOnline
      const onlineClasses = "inline-flex flex-col items-start mx-2 sm:mx-4 my-2"
      const offlineClasses = `${onlineClasses} opacity-75`
      const styles = isPlayerOnline ? onlineClasses : offlineClasses

      const showAllCards = this.props.room.currentRoundEnded ? 'showAllCards' : null

      let userTotalPoints = 0

      for (let i in player.hand) {
        const thisValue = player.hand[i].value

        if (thisValue === 'A' || thisValue === 'K' || thisValue === 'Q' || thisValue === 'J') {
          userTotalPoints += 10
        } else if (Number(thisValue) === 2) {
          userTotalPoints += 15
        } else {
          userTotalPoints += parseInt(thisValue)
        }

      }

      if (player.name === this.props.user.username) { return false }

      return (
        <div className={styles} key={player.id}>
          <span className='mb-1'>
            {isCurrentPlayer(player.name) &&
              <strong>
                {player.name}
              </strong>
            }
            {!isCurrentPlayer(player.name) && player.name}
            {this.props.room.currentRoundEnded &&
              <span className='font-bold ml-3 p-1 bg-gray-400 rounded'>
                {userTotalPoints}
              </span>
            }
          </span>
          <span className={`inline-flex showOnlyTwoCards ${showAllCards}`}>
            <RenderCards key={player.name} cards={player.hand} location='other players' />
          </span>
        </div>
      )
    })
  }
}

function mapStateToProps(state) {
  return {
    room: state.room,
    user: state.user
  }
}

export default connect(mapStateToProps)(RenderPlayers)
