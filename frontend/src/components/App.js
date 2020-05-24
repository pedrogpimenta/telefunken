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
    this.handleTableUpdate = this.handleTableUpdate.bind(this)
    this.handlePauseButton = this.handlePauseButton.bind(this)
    this.handleCardDrop = this.handleCardDrop.bind(this)

    this.renderHeader = this.renderHeader.bind(this)
    this.renderDiscardPile = this.renderDiscardPile.bind(this)
    this.renderStock = this.renderStock.bind(this)
    this.renderMain = this.renderMain.bind(this)
    this.renderPlayer = this.renderPlayer.bind(this)
    this.renderPauseButton = this.renderPauseButton.bind(this)
    this.renderBuyRequest = this.renderBuyRequest.bind(this)
    this.handleIWantItBeforeButton = this.handleIWantItBeforeButton.bind(this)

    this.cooldown = 0;
    this.startCooldown = this.startCooldown.bind(this);
    this.cooldownCountDown = this.cooldownCountDown.bind(this);
  }

  // ------------------- 
  // user actions
  // ------------------- 

  handleStartGameButton() {
    this.socket.emit('start game', this.props.room.name, this.props.user.username)
  }

  handleCardClick(cardType) {
    // stop if player is not current player
    if (this.props.user.username !== this.props.room.currentPlayer) { return false }

    if (cardType === 'stock') {
      if (this.props.room.currentPlayerHasGrabbedCard || this.props.room.playerPausedGame) { return false }

      this.socket.emit('card from stock to user', this.props.room.name, this.props.user.username)
    }
  }

  handleTableUpdate() {
    this.socket.emit('update table', this.props.room.gameId, this.props.room.table)
  }

  sendToServer(action, content) {
    this.socket.emit(action, this.props.room.gameId, this.props.user.username, content)
  }

  handlePauseButton() {
    this.socket.emit('player pauses', this.props.room.name, this.props.user.username)
  }

  handleBuying() {
    this.socket.emit('player buys', this.props.room.name, this.props.user.username)
  }

  handleAlsoWants() { 
    console.log('click also wants')
    this.socket.emit('player also wants', this.props.room.name, this.props.user.username)
  }

  handleIWantItBeforeButton() {
    console.log('no, me!')
    this.socket.emit('i want it before', this.props.room.gameId, this.props.user.username)
  }

  handleNewRoundButton() {
    console.log('new round!!')
    this.socket.emit('start new round', this.props.room.name)
  }

  handleCardDrop(cardLocation, e) {
    const removedIndex = e?.removedIndex
    const addedIndex = e?.addedIndex

    // stop if not removed or added to this group
    if (removedIndex === null && addedIndex === null) { return false }

    // if card removed from and NOT added
    if (removedIndex !== null && addedIndex === null) {
      // save drop info
      this.props.dispatch({
        type: "MOVEMENT_INFO",
        fromPosition: removedIndex
      }) 
    }

    // if card added to and NOT removed
    if (addedIndex !== null && removedIndex === null) {
      // save drop info
      this.props.dispatch({
        type: "MOVEMENT_INFO",
        to: cardLocation,
        toPosition: addedIndex
      }) 
    }

    // if card removed and added (moved inside players hand)
    if (removedIndex === addedIndex) return false

    if (removedIndex !== null && addedIndex !== null) {
      // save drop info
      this.props.dispatch({
        type: "MOVEMENT_INFO",
        to: cardLocation,
        fromPosition: removedIndex,
        toPosition: addedIndex
      }) 
    }

    // this means FROM and TO are set, do DB things
    if (this.props.cardMovement?.fromPosition >= 0 && this.props.cardMovement?.toPosition >= 0) {
      
      let card = {}
      const playerIndex = this.props.room.players.findIndex(player => player.name === this.props.user.username)
      const playerHand = this.props.room.players[playerIndex].hand
      const newTable = this.props.room.table
      
      if (this.props.cardMovement?.from === 'player') {
        card = playerHand[this.props.cardMovement?.fromPosition]
        playerHand.splice(this.props.cardMovement.fromPosition, 1)
      } else {
        const groupId = this.props.room.table.findIndex(group => group.id === this.props.cardMovement?.from)
        
        card = newTable[groupId].cards[this.props.cardMovement?.fromPosition]
        newTable[groupId].cards.splice(this.props.cardMovement?.fromPosition, 1)
        
        if (newTable[groupId].cards.length === 0) {
          newTable.splice(groupId, 1)
        }
      }
      
      if (this.props.cardMovement?.to === 'player') {
        playerHand.splice(this.props.cardMovement.toPosition, 0, card)
        
        this.props.dispatch({
          type: "UPDATE_USER_HAND",
          value: playerHand
        }) 
      } else if (this.props.cardMovement?.to === 'discard') {
        const newDiscard = this.props.room.discard
        newDiscard.push(card)
        
        this.props.dispatch({
          type: "UPDATE_DISCARD",
          value: newDiscard
        }) 
      } else if (this.props.cardMovement?.to === 'table') {
        const newGroup = {
          cards: [card]
        }
    
        newTable.push(newGroup)
        
        this.props.dispatch({
          type: "UPDATE_TABLE",
          value: newTable
        }) 
      } else {
        const groupId = this.props.room.table.findIndex(group => group.id === this.props.cardMovement?.to)
        
        newTable[groupId].cards.splice(this.props.cardMovement?.toPosition, 0, card)
        
        this.props.dispatch({
          type: "UPDATE_TABLE",
          value: newTable
        }) 
      }
      
      
      
      
      this.socket.emit('card movement', this.props.room.name, this.props.user.username, this.props.cardMovement)
      




      // remove previous drop info
      this.props.dispatch({
        type: "CLEAR_MOVEMENT_INFO"
      }) 
    }
  }

  // ------------------- 
  // render functions
  // ------------------- 

  // render header
  renderHeader() {
    if (!this.props.room.gameHasStarted) { return false }
    return (
      <div className="relative z-20 inline-flex items-end justify-between border-b border-solid border-gray-300">
        <div className="inline-flex flex-grow">
          <RenderPlayers players={this.props.room.players} />
        </div>
        <div className="inline-flex justify-center py-2">
          {this.props.room.currentRoundEnded &&
            <div className="inline-flex self-center">
              <Button
                classes='mx-2'
                onClick={(e) => {this.handleNewRoundButton(e)}}
              >
                ¡Nueva batalla!
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
    let hasHiddenCards = this.props.room.hiddenCardsWereBought ? 'noHiddenCards' : 'hasHiddenCards'
    const willAcceptDrop = this.props.room.currentPlayer === this.props.user.username && this.props.room.currentPlayerHasGrabbedCard

    const classes = `inline-flex ${hasHiddenCards} rounded border-2 border-dashed border-gray-400`

    return (
      <Container
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          marginLeft: '1rem'
        }}
        groupName={(willAcceptDrop && 'droppable') || ''}
        animationDuration={0}
        behaviour='drop-zone'
        onDrop={(e) => {this.handleCardDrop('discard', e)}}
      >
        <div
          className={classes}
          style={{minWidth: '4.3rem', minHeight: '5rem'}}
        >
          <RenderCards cards={this.props.room.discard} location='discard' />
        </div>
      </Container>
    )
  }

  // render stock
  renderStock() {
    const disableStyles = this.props.room.currentPlayer === this.props.user.username && this.props.turnCooldown > 0 ? 'opacity-25' : null
    return (
      <div className='absolute bottom-0 left-0 ml-32 mb-2 inline-flex items-center justify-center'>
        {this.props.room.currentPlayer === this.props.user.username && this.props.turnCooldown > 0 && 
          <div className='absolute top-0 left-0 w-12 md:w-16 h-full mx-2 inline-flex items-center justify-center z-40 font-bold text-2xl'>
            {this.props.turnCooldown}
          </div>
        }
        <div className={disableStyles}>
          <RenderCards
            cards={this.props.room.stock}
            location='stock'
            onClick={this.handleCardClick}
          />
        </div>
      </div>
    )
  }

  renderBuyRequest() {
    const playerWantsToBuy = this.props.playerWantsToBuy

    if (this.props.room.prevPlayer === this.props.user.username || this.props.playerWantsToBuy === this.props.user.username) { return false }

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
      <div className="relative inline-flex flex-col items-center justify-center flex-grow flex-shrink z-20">
        {!!this.props.room.gameHasStarted &&
          <Table 
            handleTableUpdate={(e) => this.handleTableUpdate(e)}
            handleCardDrop={(location, e) => this.handleCardDrop(location, e)}
            sendToServer={(action, content) => this.sendToServer(action, content)}
          />
        }
        {!!this.props.room.gameHasStarted && this.renderDiscardPile()}
        {!!this.props.room.gameHasStarted && this.renderStock()}
        {!this.props.room.gameHasStarted &&
          <div> 
            <p>Hoy en combate:</p>
            <ul>
              {this.props.room.connectedUsers.map(user => (
                <li key={`userList-${user.id}`}>
                {user.name}
                </li>
              ))}
            </ul>
            <Button
              classes="m-2 border-primary-600 bg-primary-300 text-white font-bold"
              onClick={(e) => this.handleStartGameButton(e)}
            >
              ¡A patear culos!
            </Button>
          </div>
        }
      </div>
    )
  }

  cancelPause() {
    this.socket.emit('player cancels pause', this.props.room.name)
  }

  startCooldown() {
    this.props.dispatch({
      type: "UPDATE_COOLDOWN_TIME",
      turnCooldown: this.props.room.cooldownTime
    })
    this.cooldown = setInterval(this.cooldownCountDown, 1000)
  }
  
  cooldownCountDown() {
    let newCooldownTime = this.props.turnCooldown - 1
    this.props.dispatch({
      type: "UPDATE_COOLDOWN_TIME",
      turnCooldown: newCooldownTime
    })
    
    // Check if we're at zero.
    if (this.props.turnCooldown === 0) { 
      clearInterval(this.cooldown)
    }
  }

  getNextPlayer(players, currentPlayer) {
    for (let i in players) {
      if (players[i].name === currentPlayer) {
        if ((Number(i) + 1) > (players.length - 1)) {
          return 0
        } else {
          return Number(i) + 1
        }
      }
    }
  }

  isThisUserTurn = () => this.props.user.username === this.props.room.currentPlayer

  renderPausePopup() {
    const isPrevPlayerThisPlayer = this.props.room.prevPlayer === this.props.user.username
    const hasCurrentPlayerGrabbedCard = this.props.room.currentPlayerHasGrabbedCard
    const isBuyingDisabled = isPrevPlayerThisPlayer || hasCurrentPlayerGrabbedCard

    const thisUserPaused = this.props.room.playerPausedGame === this.props.user.username

    const userHasPriority = () => {
      const thisUserPriorityIndex = this.props.room.playersByPriority.findIndex(player => player === this.props.user.username)
      const currentPlayerPriorityIndex = this.props.room.playersByPriority.findIndex(player => player === this.props.room.currentPlayer)
      const playerPausedPriorityIndex = this.props.room.playersByPriority.findIndex(player => player === this.props.room.playerPausedGame)

      return thisUserPriorityIndex === currentPlayerPriorityIndex || thisUserPriorityIndex < playerPausedPriorityIndex
    }

    return (
      <div className='absolute right-0 mb-2 mr-2 w-64 rounded-lg border-3 border-solid border-primary-600 bg-primary-300 text-white z-50' style={{bottom: '100%'}}>
        {thisUserPaused && !isBuyingDisabled &&
          <div className='flex flex-col items-center'>
            {this.isThisUserTurn() &&
              <div className='w-full p-2 text-center border-b-2 border-primary-600'>Es tu turno, ¿estás seguro?</div>
            }
            {!this.isThisUserTurn() &&
              <div className='w-full p-2 text-center border-b-2 border-primary-600'>¿Quieres comprar?</div>
            }
            <div className='m-3'>
              <Button
                classes='mb-3 w-full font-bold text-primary-600 bg-white border-primary-600'
                onClick={(e) => {this.handleBuying(e)}}
              >
                ¡Si! Me sobra la pasta
              </Button>
              <Button
                classes='w-full border-2 font-bold bg-primary-600 border-primary-600'
                onClick={(e) => {this.cancelPause(e)}}
              >
                No, paso
              </Button>
            </div>
            {!userHasPriority()  &&
              <div className='text-xs py-2 px-3 border-t-2 border-solid border-primary-600'>
                Sólo podrás comprar si estas personas no quieren:
                <strong>
                  {this.props.room.playersByPriority.map((player, index) => {
                    const thisUserPriorityIndex = this.props.room.playersByPriority.findIndex(player => player === this.props.user.username)

                    if (index < thisUserPriorityIndex) {
                      if (index === 0) {
                        return ` ${player}`
                      } else {
                        return `, ${player}`
                      }
                    }
                  })}
                </strong>
              </div>
            }
          </div>
        }
        {!thisUserPaused &&
          <div className='flex flex-col items-center'>
            <div className='w-full p-2 text-center border-b-2 border-primary-600'>
              <strong>{this.props.room.playerPausedGame}</strong> se lo está pensando
            </div>
            {userHasPriority() && !isBuyingDisabled &&
              <div className='m-3'>
                <Button
                  classes='w-full font-bold text-primary-600 bg-white border-primary-600'
                  onClick={(e) => {this.handlePauseButton(e)}}
                >
                  Ni hablar... ¡Es mía!
                </Button>
                {/* <Button
                  classes='mx-2 w-full'
                  onClick={(e) => {this.handleOk(e)}}
                >
                  Hmmm... vale.
                </Button> */}
              </div>
            }
            {!userHasPriority() && !isBuyingDisabled &&
              <div className='m-3'>
                <Button
                  classes='w-full font-bold text-primary-600 bg-white border-primary-600'
                  onClick={(e) => {this.handleAlsoWants(e)}}
                >
                  Yo también quiero!
                </Button>
              </div>
            }
            {!userHasPriority() && !isBuyingDisabled &&
              <div className='text-xs py-2 px-3 border-t-2 border-solid border-primary-600'>
                Sólo podrás comprar si estas personas al final no compran:
                <strong>
                  {this.props.room.playersByPriority.map((player, index) => {
                    const thisUserPriorityIndex = this.props.room.playersByPriority.findIndex(player => player === this.props.user.username)

                    if (index < thisUserPriorityIndex) {
                      if (index === 0) {
                        return ` ${player}`
                      } else {
                        return `, ${player}`
                      }
                    }
                  })}
                </strong>
              </div>
            }
          </div>
        }
      </div>
    )
  }

  renderPauseButton() {
    const isPrevPlayerThisPlayer = this.props.room.prevPlayer === this.props.user.username
    const hasCurrentPlayerGrabbedCard = this.props.room.currentPlayerHasGrabbedCard
    const isPauseButtonDisabled = isPrevPlayerThisPlayer || hasCurrentPlayerGrabbedCard

    const playerPausedGame = this.props.room.playerPausedGame
    const isGamePaused = !!playerPausedGame

    return (
      <div className="absolute right-0 top-0 -mt-2">
        {!isGamePaused &&
          <Button
            disabled={isPauseButtonDisabled}
            classes='mx-2 font-bold bg-primary-300 border-primary-600 text-white'
            onClick={(e) => {this.handlePauseButton(e)}}
          >
            ¡Arriba las manos!
          </Button>
        }
        {isGamePaused && this.renderPausePopup()}
        {isGamePaused &&
          <Button
            disabled={true}
            classes='mx-2'
            onClick={(e) => {this.handlePauseButton(e)}}
          >
            {this.props.room.remainingTime}
          </Button>
        }
      </div>  
    )
  }

  // render player
  renderPlayer() {
    if (!this.props.room.gameHasStarted) { return false }
    return (
      <div className="relative inline-flex items-center z-30">
        <Player
          key={this.props.user.username}
          user={this.props.user}
          room={this.props.room}
          currentPlayer={this.props.room.currentPlayer}
          handlePauseButton={e => this.handlePauseButton(e)}
          handleCardDrop={(location, e) => this.handleCardDrop(location, e)}
          sendToServer={(action, content) => this.sendToServer(action, content)}
        />
        {this.renderPauseButton()}
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
    this.socket.on('updateGame', (room) => {
      let shouldStartCooldown = false
      if (this.props.room.rounds.length > 0) {
        const currentTurn = this.props.room.rounds[this.props.room.rounds.length - 1].currentTurn
        const newTurn = room.rounds[room.rounds.length - 1].currentTurn

        if (currentTurn < newTurn) {
          shouldStartCooldown = true
        }
      }

      this.props.dispatch({ type: "UPDATE_GAME", value: room })

      if (shouldStartCooldown && this.props.room.currentPlayer === this.props.user.username) {
        this.startCooldown()
      }
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
    room: state.room,
    connectedUsers: state.connectedUsers,
    user: state.user,
    isTableActive: state.isTableActive,
    playerWantsToBuy: state.playerWantsToBuy,
    cardMovement: state.cardMovement,
    turnCooldown: state.turnCooldown
 }
}

export default connect(mapStateToProps)(withRouter(App))
