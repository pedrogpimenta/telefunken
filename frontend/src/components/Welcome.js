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
    const gameId = !!localStorage.getItem('gameId') ? localStorage.getItem('gameId') : ''
    this.setState({
      'username': username,
      'gameId': gameId
    })
  }

  render() {
    const handleGoButton = (e) => {
      e.preventDefault()
      const gameId = localStorage.getItem('gameId')

      this.props.history.push(`/game/${gameId}`)
    }

    const handleUsernameInputChange = () => {
      const username = document.getElementById('welcome__input--username').value
      localStorage.setItem('username', username)
      this.setState({'username': username})
    }

    const handleGameIdInputChange = () => {
      const gameId = document.getElementById('welcome__input--gameId').value
      localStorage.setItem('gameId', gameId)
      this.setState({'gameId': gameId})
    }

    console.log('state.username:', this.state.username)

    return (
      <div style={{ textAlign: "center" }}>
        {!!this.state.username.length &&
          <h2>¿Qué pasa, pisha?</h2>
        }
        {!this.state.username.length &&
          <h2>¡Holi, soy el Telecutren!</h2>
        }
        <form action="submit">
          {!this.state.username.length &&
            <p>¿Y tú quién eres?</p>
          }
          <Input
            type="text"
            id="welcome__input--username"
            placeholder="Enter name"
            value={this.state.username}
            onChange={() => handleUsernameInputChange()}
          />
          <p>¿Dónde dices que vas?</p>
          <Input
            type="text"
            id="welcome__input--gameId"
            placeholder="Enter game ID"
            value={this.state.gameId}
            onChange={() => handleGameIdInputChange()}
          />
          <p>
            <Button
              classes="m-2 border-primary-600 bg-primary-300 text-white font-bold"
              onClick={(e) => handleGoButton(e)}
            >
              Entrar
            </Button>
          </p>
        </form>
      </div>
    )
  }
}

export default withRouter(Welcome)
