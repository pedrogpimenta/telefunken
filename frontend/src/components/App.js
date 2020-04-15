// import packages
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import io from 'socket.io-client'

import RenderCards from './RenderCards'
import { Container } from 'react-smooth-dnd'

import Button from './Button'
import Player from './Player'
import Table from './Table'
import RenderPlayers from './RenderPlayers'

// Making the App component
class App extends Component {
  constructor () {
    super()

    this.handleStartGameButton = this.handleStartGameButton.bind(this)
    this.handleCardClick = this.handleCardClick.bind(this)
    this.handleDiscardDrop = this.handleDiscardDrop.bind(this)
    this.handleHandUpdate = this.handleHandUpdate.bind(this)
    this.handleTableUpdate = this.handleTableUpdate.bind(this)

    this.renderHeader = this.renderHeader.bind(this)
    this.renderDiscardPile = this.renderDiscardPile.bind(this)
    this.renderStock = this.renderStock.bind(this)
    this.renderMain = this.renderMain.bind(this)
    this.renderPlayer = this.renderPlayer.bind(this)
  }

  // ------------------- 
  // user actions
  // ------------------- 

  handleStartGameButton() {
    this.socket.emit('start game', this.props.gameDb.gameId, this.props.user.username)
  }

  handleCardClick(cardType) {
    // stop if player is not current player
    if (this.props.user.username !== this.props.gameDb.currentPlayer) { return false }

    if (cardType === 'stock') {
      if (this.props.gameDb.currentPlayerHasGrabbedCard) { return false }

      this.socket.emit('card from stock to user', this.props.gameDb.gameId, this.props.user.username)
    }
  }

  handleDiscardDrop(e) {
    // stop if not dropped in discard
    if (e.removedIndex === null && e.addedIndex === null) { return false }
    // stop if user hasn't grabbed card
    if (!this.props.gameDb.currentPlayerHasGrabbedCard) { return false }
    this.socket.emit('card from user to discard', this.props.gameDb.gameId, this.props.user.username, this.props.savedCard)
  }

  handleHandUpdate() {
    this.socket.emit('update user hand', this.props.gameDb.gameId, this.props.user.username, this.props.user.hand)
  }

  handleTableUpdate() {
    this.socket.emit('update table', this.props.gameDb.gameId, this.props.gameDb.table)
  }

  sendToServer(action, content) {
    this.socket.emit(action, this.props.gameDb.gameId, this.props.user.username, content)
  }

  // ------------------- 
  // render functions
  // ------------------- 

  // render header
  renderHeader() {
    return (
      <div className="inline-flex items-end justify-between border-b border-solid border-gray-300">
        <div className="inline-flex flex-grow">
          <RenderPlayers players={this.props.gameDb.players} />
        </div>
        {this.renderDiscardPile()}
        {this.renderStock()}
      </div>
    )
  }

  // render discard pile
  renderDiscardPile() {
    let hasHiddenCards = null

    for (let i in this.props.gameDb.discard) {
      hasHiddenCards = (hasHiddenCards === null || this.props.gameDb.discard[i].value) ? 'hasHiddenCards' : null
    }

    const classes = `inline-flex ${hasHiddenCards}`

    return (
      <Container
        groupName='droppable'
        animationDuration={0}
        behaviour='drop-zone'
        onDrop={(e) => {this.handleDiscardDrop(e)}}
      >
        <div className={classes}>
          <RenderCards cards={this.props.gameDb.discard} location='discard' />
        </div>
      </Container>
    )
  }

  // render stock
  renderStock() {
    return (
      <div className="inline-flex items-center justify-center m-2">
        <RenderCards cards={this.props.gameDb.stock} location='stock' onClick={this.handleCardClick} />
      </div>
    )
  }

  // render player
  renderMain() {
    return (
      <div className="inline-flex flex-col items-center justify-center flex-grow flex-shrink">
        {!!this.props.gameDb.currentRound &&
          <Table 
            handleTableUpdate={(e) => this.handleTableUpdate(e)}
            handleHandUpdate={(e) => this.handleHandUpdate(e)}
            sendToServer={(action, content) => this.sendToServer(action, content)}
          />
        }
        {!this.props.gameDb.currentRound &&
          <Button
            classes="m-2"
            onClick={(e) => this.handleStartGameButton(e)}
          >
            Start game!
          </Button>
        }
      </div>
    )
  }

  // render player
  renderPlayer() {
    return (
      <div className="inline-flex flex-col items-center">
        <Player
          key={this.props.user.username}
          user={this.props.user}
          handleHandUpdate={(e) => this.handleHandUpdate(e)}
          currentPlayer={this.props.gameDb.currentPlayer}
          sendToServer={(action, content) => this.sendToServer(action, content)}
        />
      </div>
    )
  }

  // ------------------- 
  // life cycle functions
  // ------------------- 

  componentDidMount() {
    // set gameID from path
    const gamePath = window.location.pathname.split('/')[2]
    this.props.dispatch({ type: "SET_GAMEID", gameId: gamePath })
    localStorage.setItem('gameId', gamePath)

    // TODO: Fix: if redirect happens, it register a nameless user on the room
    // get username from local storage
    const username = !!localStorage.getItem('username') ? localStorage.getItem('username') : ''
    // redirect to welcome if username is not set
    if (!username.length > 0) {
      this.props.history.push('/')
    } else {
      // Set username in db if there is one
      this.props.dispatch({ type: "SET_USERNAME", username: username })
    }

    // ------------------- 
    // socket functions
    // ------------------- 

    // socket connect
    this.socket = io.connect(this.props.endpoint, { query: 'gameId='+gamePath })

    // socket login
    this.socket.emit('login', gamePath, username)

    // receive user info
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

    // receive game info
    this.socket.on('updateGame', (gameDb) => {
      this.props.dispatch({ type: "UPDATE_GAME", value: gameDb })
    })
  }


  render() {
    return (
      <div className="w-screen h-screen overflow-hidden bg-gray-100 flex flex-col justify-stretch">
        {this.renderHeader()}
        {this.renderMain()}
        {this.renderPlayer()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    endpoint: state.endpoint,
    gameId: state.gameId,
    gameDb: state.gameDb,
    connectedUsers: state.connectedUsers,
    user: state.user,
    isTableActive: state.isTableActive,
    savedCard: state.savedCard
  }
}

export default connect(mapStateToProps)(withRouter(App))
