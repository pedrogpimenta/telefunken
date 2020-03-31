import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import Input from './Input.js'
import Button from './Button.js'

// Making the App component
class Welcome extends Component {
  constructor() {
    super()
   
    this.state = {
      username: '',
      gameId: ''
    } 
  }

  componentDidMount() {
    const username = !!localStorage.getItem('username') ? localStorage.getItem('username') : ''
    this.setState({'username': username})
  }

  render() {
    const handleGoButton = (e) => {
      e.preventDefault()
      const username = document.getElementById('welcome__input--username').value
      const gameId = document.getElementById('welcome__input--gameId').value

      localStorage.setItem('username', username)
      localStorage.setItem('gameId', gameId)
      this.props.history.push(`/game/${gameId}`)
    }

    const handleUsernameInputChange = () => {
      const username = document.getElementById('welcome__input--username').value
      this.setState({'username': username})
    }

    const handleGameIdInputChange = () => {
      const gameId = document.getElementById('welcome__input--gameId').value
      this.setState({'gameId': gameId})
    }

    return (
      <div style={{ textAlign: "center" }}>
        <h2>Welcome!</h2>
        <form action="submit">
          <p>What's your name?</p>
          <Input
            type="text"
            id="welcome__input--username"
            placeholder="Enter name"
            value={this.state.username}
            onChange={() => handleUsernameInputChange()}
          />
          <p>Name a game:</p>
          <Input
            type="text"
            id="welcome__input--gameId"
            placeholder="Enter game ID"
            value={this.state.gameId}
            onChange={() => handleGameIdInputChange()}
          />
          <p>
            <Button
              classes="m-2"
              onClick={(e) => handleGoButton(e)}
            >
              Go!
            </Button>
          </p>
        </form>
      </div>
    )
  }
}

export default withRouter(Welcome)
