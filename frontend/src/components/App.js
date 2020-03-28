// import packages
import React, { Component } from 'react'
import io from 'socket.io-client'

import Player from './Player'

let socket

// Making the App component
class App extends Component {
  constructor() {
    super()
   
    this.state = {
      endpoint: 'localhost:4001',
      connectedUsers: [],
      user: {
        username: '',
        cards: 0
      },
      username: '',
      testPietro: 0
    } 

    this.send = this.send.bind(this)
    this.handleCardAddButton = this.handleCardAddButton.bind(this)
    socket = io.connect(this.state.endpoint);
  }

  send(content) {
    //const socket = io(this.state.endpoint);
    //socket.emit('username', content)
  }

  handleCardAddButton() {
    //const socket = io(this.state.endpoint);
    //socket.emit('handleCardAddButton', this.state.username)
    //
    this.setState(prevState => {
      const updateUserCards = prevState.user.cards + 1
      return {
        user: {
          ...this.state.user,
          cards: updateUserCards
        }
      }
    })

    //const socket = io(this.state.endpoint);
    socket.emit('handleCardAddButton', this.state.user)
  }

  componentDidMount() {
    const username = !!localStorage.getItem('username') ? localStorage.getItem('username') : ''
    this.setState(prevState => {
      return {
        user: {
          ...this.state.user,
          username: username
        }
      }
    })


    socket.emit('username', username)
    

    socket.on('testNumbers', (object) => {
      console.log('object:', object)
    })

    socket.on('connectedUsers', (connectedUsers) => {
      console.log('update')
      this.setState({'connectedUsers': connectedUsers})
    })

    socket.on('updateUserCards', (numberOfCards) => {
      console.log('updateUserCards:', numberOfCards)

      this.setState(prevState => {
        return {
          user: {
            ...this.state.user,
            cards: numberOfCards
          }
        }
      })
    })


  }

  render() {
    const renderUser = () => <Player key={this.state.user.username} username={this.state.user.username} cards={this.state.user.cards} />
    const renderPlayers = this.state.connectedUsers.map(player => {
      if (player.username !== this.state.user.username) {
        return (
          <Player key={player.id} username={player.username} cards={player.cards} />
        )
      }
    })

    return (
      <div style={{ textAlign: "center" }}>
        <div>
          <span>You: {renderUser()}</span>
        </div>
        <div>
          <span>Other players:</span><span>{renderPlayers}</span>
        </div>
        <div>
          Number of connected players: {this.state.connectedUsers.length}
        </div>
        <div>
          <button onClick={() => this.handleCardAddButton()}>Add test</button>
        </div>
      </div>
    )
  }
}

export default App
