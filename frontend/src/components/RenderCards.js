import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Draggable } from 'react-smooth-dnd'
import PlayingCard from './PlayingCard'

class RenderCards extends Component {
  constructor() {
    super()

    this.handleStockCardClick = this.handleStockCardClick.bind(this)

    this.handleCardDragStart = this.handleCardDragStart.bind(this)
    this.handleCardDragEnd = this.handleCardDragEnd.bind(this)
    this.showUngrabbed = this.showUngrabbed.bind(this)
  }

  // Pass stock click to parent
  handleStockCardClick(e) {
    this.props.onClick('stock', e)
  }

  // ------------------- 
  // player card actions
  // ------------------- 

  // player hand -- drag start
  handleCardDragStart(cardLocation, e) {
    this.props.dispatch({ type: 'USER_IS_DRAGGING' })

    if ( !e.isSource ) { return false }

    this.props.dispatch({
      type: 'MOVEMENT_INFO',
      from: cardLocation
    })
  }

  // player hand -- drag end
  handleCardDragEnd() {
    this.props.dispatch({ type: 'USER_IS_NOT_DRAGGING' })
  }

  showUngrabbed() {
    if (this.props.room.currentPlayer === this.props.user.username) {
      if (this.props.room.currentPlayerHasGrabbedCard) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }

  render() {
    switch(this.props.location) {
      case 'discard':
        if (!!this.props.cards) {
          return this.props.cards.map(card => <PlayingCard
            key={card.id}
            id={card.id}
            value={card.value}
            suit={card.suit}
            type={this.props.location}
          />)
        }
        break
      case 'stock':
        return <PlayingCard
            value={this.props.cards}
            type={this.props.location}
            showUngrabbed={this.showUngrabbed}
            onClick={(e) => this.handleStockCardClick(e)}
          />
      case 'other players':
        const cardsLength = this.props.cards.length
        const showCardValue = this.props.room.currentRoundEnded

        return this.props.cards.map((card, i) => {
          let showCardsLength = showCardValue ? card.value : 0
          if (showCardsLength === 0 && this.props.cards.length === i + 1) {
            showCardsLength = (this.props.cards.length === i + 1) ? cardsLength : null
          }
          return (
            <PlayingCard
              key={card.id}
              id={card.id}
              value={showCardsLength}
              suit={card.suit}
              type={this.props.location}
              showCardValue={showCardValue}
            />)
          })
      case 'table':
        if (!!this.props.cards) {
          // const numberOfCards = this.props.cards.length
          // const maxWidth = 100/numberOfCards + '%'
          return (
            <div className="border-2 border-dashed border-gray-400 rounded-lg mx-4 p-1 z-10 tableGroupSm md:tableGroupMd">
              <Container
                style={{
                  display: 'flex',
                  maxWidth: '100vw',
                  flexWrap: 'wrap'
                }}
                orientation='horizontal'
                groupName='droppable'
                dragBeginDelay={0}
                onDragStart={(e) => {this.handleCardDragStart(this.props.id, e)}}
                onDragEnd={(e) => {this.handleCardDragEnd(this.props.id, e)}}
                onDrop={(e) => {this.props.handleCardDrop(this.props.id, e)}}
              >
                {this.props.cards.map((card, index) => (
                  <Draggable
                    key={index}
                    className="inline-flex w-8"
                    // style={{width: '1.5rem'}}
                  >
                    <PlayingCard
                      key={card.id}
                      id={card.id}
                      value={card.value}
                      suit={card.suit}
                    />
                  </Draggable>)
                )}
              </Container>
            </div>
          )
        }
        break
      default:
        if (!!this.props.cards) {
          const numberOfCards = this.props.cards.length
          const maxWidth = 100/numberOfCards + '%'

          return (
            <Container style={{
                display: 'flex',
                maxWidth: '100vw',
                flexWrap: 'wrap'
              }}
              orientation='horizontal'
              groupName='droppable'
              dragBeginDelay={0}
              onDragStart={(e) => {this.handleCardDragStart('player', e)}}
              onDragEnd={(e) => {this.handleCardDragEnd('player')}}
              onDrop={(e) => {this.props.handleCardDrop('player', e)}}
            >
              {this.props.cards.map((card, index) => (
                <Draggable key={index} className="inline-flex" style={{maxWidth: maxWidth}}>
                  <PlayingCard
                    key={card.id}
                    id={card.id}
                    value={card.value}
                    suit={card.suit}
                  />
                </Draggable>)
              )}
            </Container>
          )
        }
      break
    }
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    room: state.room,
    cardMovement: state.cardMovement
  }
}

export default connect(mapStateToProps)(RenderCards)
