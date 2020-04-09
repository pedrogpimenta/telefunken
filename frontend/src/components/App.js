// import packages
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import io from 'socket.io-client'

import RenderCards from './RenderCards'

import Button from './Button'
import Player from './Player'
import Table from './Table'
import RenderPlayers from './RenderPlayers'

// Making the App component
class App extends Component {
  constructor () {
    super()

    this.handleCardClick = this.handleCardClick.bind(this)
  }
  handleStartGameButton() {
    this.socket.emit('start game', this.props.gameId, this.props.user.username)
  }

  handleResetButton() {
    let confirmDelete = window.confirm('Are you sure you want to delete?')
    if (confirmDelete) {
      this.socket.emit('reset game', this.props.gameId)
    }
  }

  handleCardClick(cardType, card) {
    if (this.props.user.username !== this.props.gameDb.currentPlayer) {return false}

    if (cardType === 'user') {
      if (!this.props.gameDb.currentPlayerHasGrabbedCard) {
        alert('You have to grab a card first')
        return false
      }

      let thisUserHand = this.props.user.hand.slice()

      if (this.props.isTableActive) {

      } else {
        for (let i in thisUserHand) {
          if (thisUserHand[i].id === card.id) {
            thisUserHand[i].selected = !thisUserHand[i].selected
          }
        }

        this.props.dispatch({
          type: "UPDATE_USER_INFO",
          id: this.props.user.id,
          username: this.props.user.username,
          isOnline: this.props.user.isOnline,
          hand: thisUserHand
        })
      }

    } else if (cardType === 'stock') {

      if (this.props.gameDb.currentPlayerHasGrabbedCard) {
        alert('You have already grabbed a card this round')
        return false
      }

      this.socket.emit('card from stock to user', this.props.gameId, this.props.user.username)

    }


  }

  handleSendCardToDiscardButton() {
    const thisUserHand = this.props.user.hand
    let selectedCards = []
    for (let i in thisUserHand) {
      if (thisUserHand[i].selected) {
        selectedCards.push(thisUserHand[i])
      }
    }

    if (selectedCards.length === 1) {
      this.socket.emit('card from user to discard', this.props.gameId, this.props.user.username, selectedCards[0])
    } else {
      alert('You can only send one card to the discard pile')
    }
  }

  handleSendCardToTableButton() {
    this.props.dispatch({ type: 'USER_IS_SENDING_TO_TABLE' })




    const thisUserHand = this.props.user.hand
    let selectedCards = []
    for (let i in thisUserHand) {
      if (thisUserHand[i].selected) {
        selectedCards.push(thisUserHand[i])
      }
    }



    this.socket.emit('card from user to table', this.props.gameId, this.props.user.username, selectedCards)
  }

  handleHandUpdate() {
    this.socket.emit('update user hand', this.props.gameId, this.props.user.username, this.props.user.hand)
  }

  handleTableUpdate() {
    this.socket.emit('update table', this.props.gameId, this.props.gameDb.table)
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
    const renderPlayer = () => (
      <Player
        key={this.props.user.username}
        user={this.props.user}
        handleCardClick={this.handleCardClick}
        handleHandUpdate={(e) => this.handleHandUpdate(e)}
        currentPlayer={this.props.gameDb.currentPlayer}
      />
    )

    // Render Stock
    const renderStock = () => {
      return (
        <div className="inline-flex items-center justify-center m-2">
          <RenderCards cards={this.props.gameDb.stock} location='stock' onClick={this.handleCardClick} />
        </div>
      )
    }

    const isSomeCardSelected = () => {
      let someCardIsSelected = []

      for (let i in this.props.user.hand) {
        if (this.props.user.hand[i].selected) {
          someCardIsSelected.push(i)
        }
      }

      return someCardIsSelected.length === 1
    }

    // Render discard pile
    const renderDiscardPile = () => {
      let hasHiddenCards = null

      for (let i in this.props.gameDb.discard) {
        hasHiddenCards = (hasHiddenCards === null || this.props.gameDb.discard[i].value) ? 'hasHiddenCards' : null
      }

      const classes = `inline-flex ${hasHiddenCards}`

      return (
        <div className={classes}>
          <RenderCards cards={this.props.gameDb.discard} location='discard' onClick={this.handleCardClick} />
        </div>
      )
    }

    const renderSendCardToDiscardButton = () => {
      let thisButtonClasses = 'mx-2'
      if (!isSomeCardSelected()) {
        thisButtonClasses = 'mx-2 opacity-50 cursor-not-allowed'
      }

      return (
        <Button
          classes={thisButtonClasses}
          onClick={(e) => this.handleSendCardToDiscardButton(e)}
        >
          Send to Discard
        </Button>
      )
    }

    return (
      <div className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-gray-100 flex flex-col justify-stretch">
        <div className="inline-flex items-end justify-between border-b border-solid border-gray-300">
          <div className="inline-flex flex-grow">
            <RenderPlayers players={this.props.gameDb.players} />
          </div>
          {renderDiscardPile()}
          {renderStock()}
        </div>
        <div className="inline-flex flex-col flex-grow">
          <Table 
            onClick={(e) => this.handleCardClick(e)}
            handleTableUpdate={(e) => this.handleTableUpdate(e)}
            handleHandUpdate={(e) => this.handleHandUpdate(e)}
          />
          {!this.props.gameDb.currentRound &&
            <Button
              classes="m-2"
              onClick={(e) => this.handleStartGameButton(e)}
            >
              Start game!
            </Button>
          }
        </div>
        <div className="row-start-3 row-end-4 inline-flex flex-col items-center">
          <div className="inline-flex flex-row">
            {renderSendCardToDiscardButton()}
          </div>
          {renderPlayer()}
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
    user: state.user,
    isTableActive: state.isTableActive
  }
}

export default connect(mapStateToProps)(withRouter(App))
