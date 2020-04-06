import React, { Component } from 'react'
import { connect } from 'react-redux'
import renderCards from '../renderCards'

class RenderPlayers extends Component {
  render() {
    const isCurrentPlayer = (playerUsername) => {
      return this.props.gameDb.currentPlayer === playerUsername
    }
    const isPlayerOnline = !!this.props.user.isOnline
    const onlineClasses = "inline-flex flex-col items-start my-2"
    const offlineClasses = `${onlineClasses} opacity-75`
    const styles = isPlayerOnline ? onlineClasses : offlineClasses

    const renderPlayers = () => this.props.gameDb.players.map(player => {
      console.log(player.username, 'is current player:', isCurrentPlayer(player.username))
      if (player.username !== this.props.user.username) {
        return (
          <div className={styles}>
            <span>
              {isCurrentPlayer(player.username) &&
                <strong>
                  {player.username}
                </strong>
              }
              {!isCurrentPlayer(player.username) && player.username}
            </span>
            <span className="ml-3">
              {renderCards(player.hand, 'other players')}
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
