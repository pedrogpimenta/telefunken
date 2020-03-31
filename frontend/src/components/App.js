// import packages
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import io from 'socket.io-client'

import Player from './Player'
import Button from './Button.js'

// Making the App component
class App extends Component {
  constructor() {
    super()
    this.handleCardAddButton = this.handleCardAddButton.bind(this)
  }

  handleCardAddButton() {
    // Set Increment
    this.props.dispatch({ type: "INCREMENT_USER_CARDS", value: 1 })
    // Send Increment
    console.log('gameId:', this.props.gameId)
    this.socket.emit('handleCardAddButton', this.props.gameId, this.props.user)
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
        this.props.dispatch({ type: "UPDATE_USER_INFO", username: userInfo.username, id: userInfo.id, userCards: userInfo.userCards })
      }
    })

    // Update connectedUsers
    this.socket.on('connectedUsers', (connectedUsers) => {
      this.props.dispatch({ type: "SET_CONNECTEDUSERS", value: connectedUsers })
    })
  }

  render() {
    // Render user info
    const renderUser = () => <Player key={this.props.user.username} user={this.props.user}  />

    // Render other players
    const renderPlayers = this.props.connectedUsers.map(player => {
      if (player.username !== this.props.user.username) {
        return (
          <Player key={player.username} user={player} />
        )
      }
      return false
    })

    return (
      <div style={{ textAlign: "center" }}>
        <div>
          <span>You: {renderUser()}</span>
        </div>
        <hr />
        <div>
          <span>Other players:</span><span>{renderPlayers}</span>
        </div>
        <div>
          Number of connected players: {this.props.connectedUsers.length}
        </div>
        <div>
          <Button
            classes="m-2"
            onClick={(e) => this.handleCardAddButton(e)}
          >
            Go!
          </Button>
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
    connectedUsers: state.connectedUsers,
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(App))
