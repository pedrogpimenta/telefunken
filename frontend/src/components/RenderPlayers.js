import React, { Component } from 'react'
import { connect } from 'react-redux'
import RenderCards from './RenderCards'

class RenderPlayers extends Component {
  render() {
    const isCurrentPlayer = (playerUsername) => {
      return this.props.gameDb.currentPlayer === playerUsername
    }
    const isPlayerOnline = !!this.props.user.isOnline
    const onlineClasses = "inline-flex flex-col items-start mx-2 sm:mx-4 my-2"
    const offlineClasses = `${onlineClasses} opacity-75`
    const styles = isPlayerOnline ? onlineClasses : offlineClasses

    const renderPlayers = () => this.props.gameDb.players.map(player => {
      if (player.username !== this.props.user.username) {
        return (
          <div className={styles} key={player.id}>
            <span className='mb-1'>
              {isCurrentPlayer(player.username) &&
                <strong>
                  {player.username}
                </strong>
              }
              {!isCurrentPlayer(player.username) && player.username}
            </span>
            <span className="inline-flex ml-10 showOnlyTwoCards sm:showAllCards">
              <RenderCards key={77} cards={player.hand} location='other players' />
            </span>
          </div>
        )
      }

      return null
    })

    return renderPlayers()
  }
}

function mapStateToProps(state) {
  return {
    count: state.count,
    endpoint: state.endpoint,
    gameId: state.gameId,
    gameDb: state.gameDb,
    connectedUsers: state.connectedUsers,
    user: state.user
  }
}

export default connect(mapStateToProps)(RenderPlayers)
