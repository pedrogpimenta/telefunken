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
      <div style={{
        textAlign: "center",
        marginTop: "1rem"
      }}>
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
            placeholder="Dime tu nombre"
            value={this.state.username}
            onChange={() => handleUsernameInputChange()}
          />
          <p style={{
            marginTop: ".5rem"
          }}>¿Dónde dices que vas?</p>
          <Input
            type="text"
            id="welcome__input--gameId"
            placeholder="Dime la sala"
            value={this.state.gameId}
            onChange={() => handleGameIdInputChange()}
          />
          <p>
            <Button
              classes="m-2 mt-4 border-primary-600 bg-primary-300 text-white font-bold"
              onClick={(e) => handleGoButton(e)}
            >
              Pa' dentro
            </Button>
          </p>
        </form>
        <div
          style={{
            display: "inline-block",
            textAlign: "center",
            width: "50%",
            borderRadius: '6px',
            marginTop: '1rem',
            overflow: 'hidden'
          }}
        >
          <img src="/foto1.jpg" alt="Logo" />
        </div>
      </div>
    )
  }
}

export default withRouter(Welcome)
