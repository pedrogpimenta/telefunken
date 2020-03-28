// import packages
import React, { Component } from 'react'
import io from 'socket.io-client'

// Making the App component
class App extends Component {
  constructor() {
    super()
   
    this.state = {
      endpoint: 'alocalhost:4001',
      username: ''
    } 
  }

  componentDidMount() {
    const hasSavedUsername = !!localStorage.getItem('username')
    const username = localStorage.getItem('username')

    if (hasSavedUsername) {
      this.setState({'username': username})
    }
  }


  render() {
    const socket = io(this.state.endpoint);

    const handleClick = () => {
      console.log('clicked2');
      socket.emit('test', 'test value');
      return false;
    };


    return (
      <div style={{ textAlign: "center" }}>
        <button onClick={() => handleClick()}>Button</button>
      </div>
    )
  }
}

export default App
