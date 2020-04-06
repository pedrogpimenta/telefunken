// import packages
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import io from 'socket.io-client'

import renderCards from '../renderCards'

import Button from './Button'
import Player from './Player'
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

    console.log('cardType:', cardType)

    if (cardType === 'user') {
      console.log('card.id:', card.id)

      let thisUserHand = this.props.user.hand

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

    } else if (cardType === 'stock') {

      if (this.props.gameDb.currentPlayerHasGrabbedCard) {
        alert('You have already grabbed a card this round')
      } else {
        this.socket.emit('card from stock to user', this.props.gameId, this.props.user.username)
      }

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
        currentPlayer={this.props.gameDb.currentPlayer}
      />
    )

    // Render Stock
    const renderStock = () => {
      return (
        <div className="flex items-center justify-center my-2">
          Stock: {
            renderCards(
              this.props.gameDb.stock, 'stock', this.handleCardClick
            )
          }
        </div>
      )
    }

    // Render discard pile
    const renderDiscardPile = () => {
      let thisUserHand = this.props.user.hand

      const isSomeCardSelected = () => {
        let someCardIsSelected = []

        for (let i in thisUserHand) {
          if (thisUserHand[i].selected) {
            console.log('yeah')
            someCardIsSelected.push(i)
          }
        }

        return someCardIsSelected.length === 1
      }

      const renderSendCardToDiscardButton = () => {
        if (isSomeCardSelected()) {
          return (
            <Button
              classes="m-2"
              onClick={(e) => this.handleSendCardToDiscardButton(e)}
            >
              Send to Discard
            </Button>
          )
        }
      }

      return (
        <div className="inline-flex items-center justify-center my-2">
          Discard pile: {
            renderCards(
              this.props.gameDb.discard, 'discard', this.handleCardClick
            )
          }
          {renderSendCardToDiscardButton()}
        </div>
      )
    }

    return (
      <div className="w-screen h-screen bg-gray-100 grid grid-cols-1 grid-rows-3">
        <div className="row-start-3 row-end-4 inline-flex flex-col items-center">
          {renderPlayer()}
        </div>
        <div>
          <div>
            <RenderPlayers players={this.props.gameDb.players} />
          </div>
          {renderStock()}
          {renderDiscardPile()}
        </div>
        <div>
          {!this.props.gameDb.currentRound &&
            <Button
              classes="m-2"
              onClick={(e) => this.handleStartGameButton(e)}
            >
              Start game!
            </Button>
          }
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
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(App))
