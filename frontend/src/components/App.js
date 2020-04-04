// import packages
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import io from 'socket.io-client'

import renderCards from '../renderCards'

import Player from './Player'
import Button from './Button'

// Making the App component
class App extends Component {
  handleStartGameButton() {
    this.socket.emit('start game', this.props.gameId, this.props.user.username)
  }

  handleResetButton() {
    let confirmDelete = window.confirm('Are you sure you want to delete?')
    if (confirmDelete) {
      this.socket.emit('reset game', this.props.gameId)
    }
  }

  componentDidMount() {
    // Set gameID from path
    const gamePath = window.location.pathname.split('/')[2]
    this.props.dispatch({ type: "SET_GAMEID", gameId: gamePath })

    // Socket connect
    this.socket = io.connect(this.props.endpoint, { query: 'gameId='+gamePath })

    // Set username
    const username = !!localStorage.getItem('username') ? localStorage.getItem('username') : ''
    this.props.dispatch({ type: "SET_USERNAME", username: username })

    // Socket Login
    this.socket.emit('login', gamePath, username)

    // Update user info
    this.socket.on('updateUserInfo', (userInfo) => {
      if (this.props.user.username === userInfo.username) {
        this.props.dispatch({
          type: "UPDATE_USER_INFO",
          username: userInfo.username,
          id: userInfo.id,
          isOnline: userInfo.isOnline,
          hand: userInfo.hand
        })
      }
    })

    // update game
    this.socket.on('updateGame', (gameDb) => {
      this.props.dispatch({ type: "UPDATE_GAME", value: gameDb })
    })
  }

  render() {
    // Render user info
    const renderUser = () => <Player key={this.props.user.username} user={this.props.user}  />

    // Render other players
    const renderPlayers = () => this.props.gameDb.players.map(player => {
      if (player.username !== this.props.user.username) {
        return (
          <Player key={player.username} user={player} />
        )
      }
      return false
    })

    // Render Stock
    const renderStock = () => {
      return (
        <div className="flex items-center justify-center my-2">
          Stock: {
            renderCards(
              this.props.gameDb.stock, 'stock', this.handleCardClick
            )
          }
        </div>
      )
    }

    // Render discard pile
    const renderDiscardPile = () => {
      return (
        <div className="inline-flex items-center justify-center my-2">
          Discard pile: {
            renderCards(
              this.props.gameDb.discard, 'discard'
            )
          }
        </div>
      )
    }

    return (
      <div style={{ textAlign: "center" }}>
        <div className="inline-flex items-center">
          <span>You: {renderUser()}</span>
        </div>
        <hr />
        <div>
        </div>
        <div className="inline-flex items-center my-2">
          Discard pile: {renderCards(this.props.gameDb.discard)}
        </div>
        <div>
          Number of connected players: {this.props.gameDb.players.length}
          <span>Players:</span><span>{this.props.gameDb.players.length}</span>
        </div>
        <div>
          <Button
            classes="m-2"
            onClick={(e) => this.handleStartGameButton(e)}
          >
            Start game!
          </Button>
          <span>Other players:</span><span>{renderPlayers()}</span>
        </div>
        {renderStock()}
        {renderDiscardPile()}
        <div>
          {!this.props.gameDb.currentRound &&
            <Button
              classes="m-2"
              onClick={(e) => this.handleStartGameButton(e)}
            >
              Start game!
            </Button>
          }
        </div>
      </div>
    )
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

export default connect(mapStateToProps)(withRouter(App))
