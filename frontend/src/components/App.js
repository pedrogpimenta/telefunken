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
    this.handleBuyButton = this.handleBuyButton.bind(this)

    this.renderHeader = this.renderHeader.bind(this)
    this.renderDiscardPile = this.renderDiscardPile.bind(this)
    this.renderStock = this.renderStock.bind(this)
    this.renderMain = this.renderMain.bind(this)
    this.renderPlayer = this.renderPlayer.bind(this)
    this.renderBuyButton = this.renderBuyButton.bind(this)
    this.renderBuyRequest = this.renderBuyRequest.bind(this)
    this.handleIWantItBeforeButton = this.handleIWantItBeforeButton.bind(this)
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

  handleBuyButton() {
    console.log('buy!')
    this.socket.emit('player buys', this.props.gameDb.gameId, this.props.user.username)
  }

  handleIWantItBeforeButton() {
    console.log('no, me!')
    this.socket.emit('i want it before', this.props.gameDb.gameId, this.props.user.username)
  }

  handleNewRoundButton() {
    console.log('new round!!')
    this.socket.emit('start new round', this.props.gameDb.gameId)
  }

  // ------------------- 
  // render functions
  // ------------------- 

  // render header
  renderHeader() {
    if (!this.props.gameDb.currentRound) { return false }
    return (
      <div className="relative z-20 inline-flex items-end justify-between border-b border-solid border-gray-300">
        <div className="inline-flex flex-grow">
          <RenderPlayers players={this.props.gameDb.players} />
        </div>
        <div className="inline-flex justify-center py-2">
          {this.props.gameDb.currentRoundEnded &&
            <div className="inline-flex self-center">
              <Button
                classes='mx-2'
                onClick={(e) => {this.handleNewRoundButton(e)}}
              >
                Nueva ronda!
              </Button>
            </div>
          }
        </div>
        {this.renderBuyRequest()}
      </div>
    )
  }

  // render discard pile
  renderDiscardPile() {
    let hasHiddenCards = this.props.gameDb.hiddenCardsWereBought ? 'noHiddenCards' : 'hasHiddenCards'

    const classes = `inline-flex ${hasHiddenCards} rounded border-2 border-dashed border-gray-400`

    return (
      <Container
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          marginLeft: '1rem'
        }}
        groupName='droppable'
        animationDuration={0}
        behaviour='drop-zone'
        onDrop={(e) => {this.handleDiscardDrop(e)}}
      >
        <div
          className={classes}
          style={{minWidth: '4.3rem', minHeight: '5rem'}}
        >
          <RenderCards cards={this.props.gameDb.discard} location='discard' />
        </div>
      </Container>
    )
  }

  // render stock
  renderStock() {
    return (
      <div className="absolute bottom-0 left-0 ml-32 mb-2 inline-flex items-center justify-center">
        <RenderCards cards={this.props.gameDb.stock} location='stock' onClick={this.handleCardClick} />
      </div>
    )
  }

  renderBuyRequest() {
    const playerWantsToBuy = this.props.playerWantsToBuy

    if (this.props.gameDb.prevPlayer === this.props.user.username || this.props.playerWantsToBuy === this.props.user.username) { return false }

    if (!!playerWantsToBuy) {
      return(
        <div
          className='absolute bottom-0 right-0 rounded mr-2 p-2 text-center bg-red-400'
          style={{transform: 'translateY(110%)'}}
        >
          {playerWantsToBuy} wants to buy!
          <div className='flex mt-2'>
            <Button
              classes="mr-1"
            >
              OK
            </Button>
            <Button
              classes="ml-1"
              onClick={(e) => {this.handleIWantItBeforeButton(e)}}
            >
              No, me!
            </Button>
          </div>
        </div>
      )
    }

    return false
  }

  // render player
  renderMain() {
    return (
      <div className="relative inline-flex flex-col items-center justify-center flex-grow flex-shrink">
        {!!this.props.gameDb.currentRound &&
          <Table 
            handleTableUpdate={(e) => this.handleTableUpdate(e)}
            handleHandUpdate={(e) => this.handleHandUpdate(e)}
            sendToServer={(action, content) => this.sendToServer(action, content)}
          />
        }
        {!!this.props.gameDb.currentRound && this.renderDiscardPile()}
        {!!this.props.gameDb.currentRound && this.renderStock()}
        {!this.props.gameDb.currentRound &&
          <div> 
            <p>Jugadores:</p>
            <ul>
              {this.props.gameDb.players.map(player => (
                <li key={`playerList-${player.id}`}>
                {player.username}
                </li>
              ))}
            </ul>
            <Button
              classes="m-2"
              onClick={(e) => this.handleStartGameButton(e)}
            >
              Start game!
            </Button>
          </div>
        }
      </div>
    )
  }

  renderBuyButton() {
    const isPrevPlayerThisPlayer = this.props.gameDb.prevPlayer === this.props.user.username
    const hasCurrentPlayerGrabbedCard = this.props.gameDb.currentPlayerHasGrabbedCard
    const isBuyButtonDisabled = isPrevPlayerThisPlayer || hasCurrentPlayerGrabbedCard

    return (
      <div className="absolute right-0 top-0">
        <Button
          disabled={isBuyButtonDisabled}
          classes='mx-2'
          onClick={(e) => {this.handleBuyButton(e)}}
        >
          Comprar
        </Button>
      </div>  
    )
  }

  // render player
  renderPlayer() {
    if (!this.props.gameDb.currentRound) { return false }
    return (
      <div className="relative inline-flex items-center">
        <Player
          key={this.props.user.username}
          user={this.props.user}
          handleHandUpdate={(e) => this.handleHandUpdate(e)}
          currentPlayer={this.props.gameDb.currentPlayer}
          handleBuyButton={(e) => this.handleBuyButton(e)}
          sendToServer={(action, content) => this.sendToServer(action, content)}
        />
        {this.renderBuyButton()}
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

    // receive buy request
    this.socket.on('player wants to buy', (username) => {
      this.props.dispatch({ type: "PLAYER_WANTS_TO_BUY", value: username })
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
    savedCard: state.savedCard,
    playerWantsToBuy: state.playerWantsToBuy
  }
}

export default connect(mapStateToProps)(withRouter(App))
