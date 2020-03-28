import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

// Making the App component
class Welcome extends Component {
  constructor() {
    super()
   
    this.state = {
      username: ''
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

      localStorage.setItem('username', username)
      this.props.history.push('/game')
    }

    const handleUsernameInputChange = () => {
      const username = document.getElementById('welcome__input--username').value
      this.setState({'username': username})
    }

    return (
      <div style={{ textAlign: "center" }}>
        <h2>Welcome!</h2>
        <form action="submit">
          <p>What's your name?</p>
          <input
            id="welcome__input--username"
            type="text"
            placeholder="Enter name"
            value={this.state.username}
            onChange={() => handleUsernameInputChange()}
          />
          <button onClick={(e) => handleGoButton(e)}>Go!</button>
        </form>
      </div>
    )
  }
}

export default withRouter(Welcome)
