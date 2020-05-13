import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Draggable } from 'react-smooth-dnd'
import PlayingCard from './PlayingCard'

class RenderCards extends Component {
  constructor() {
    super()

    this.handleStockCardClick = this.handleStockCardClick.bind(this)

    this.handleCardDropReady = this.handleCardDropReady.bind(this)
    this.handleCardDragStart = this.handleCardDragStart.bind(this)
    this.handleCardDragEnd = this.handleCardDragEnd.bind(this)
    this.handlePlayerDragEnter = this.handlePlayerDragEnter.bind(this)
    this.handlePlayerDragLeave = this.handlePlayerDragLeave.bind(this)

    this.handleTableGroupDropReady = this.handleTableGroupDropReady.bind(this)
    this.handleTableGroupDrop = this.handleTableGroupDrop.bind(this)
    this.handleTableGroupDragStart = this.handleTableGroupDragStart.bind(this)
    this.handleTableGroupDragEnd = this.handleTableGroupDragEnd.bind(this)
    this.handleTableGroupDragEnter = this.handleTableGroupDragEnter.bind(this)
    this.handleTableGroupDragLeave = this.handleTableGroupDragLeave.bind(this)
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

    console.log('card FROM:', cardLocation)

    this.props.dispatch({
      type: 'MOVEMENT_INFO',
      from: cardLocation
    })
  }

  // player hand -- drag end
  handleCardDragEnd() {
    this.props.dispatch({ type: 'USER_IS_NOT_DRAGGING' })
  }

  // player area -- right before drop
  handleCardDropReady(index, e) {
    // const removedIndex = e.removedIndex

    // // get current dragged card
    // let currentCards = this.props.cards.slice()
    // let draggedCard = currentCards[removedIndex]
    
    // // save card to state
    // if (draggedCard) {
    //   this.props.dispatch({
    //     type: "SAVE_CARD",
    //     card: draggedCard
    //   })  
    // }
  }

  // player hand -- enter area
  handlePlayerDragEnter() {
    // this.props.dispatch({
    //   type: 'SAVE_GROUP_TO',
    //   group: 'player'
    // }) 
  }

  // player hand -- leave area
  handlePlayerDragLeave() {
    // this.props.dispatch({
    //   type: 'SAVE_GROUP_FROM',
    //   group: 'player'
    // }) 
  }

  // ------------------- 
  // table groups card actions
  // ------------------- 

  handleTableGroupDropReady(id, e) {
    const removedIndex = e.removedIndex

    const groupIndex = this.props.room.table.findIndex(group => group.id === id)

    let newGroup = {...this.props.room.table[groupIndex]}
    let draggedCard = newGroup.cards[removedIndex]
    
    // save card to state
    if (draggedCard) {
      this.props.dispatch({
        type: "SAVE_CARD",
        card: draggedCard
      })  
    }
  }

  // card drops in table group
  handleTableGroupDrop(id, e) {
    const removedIndex = e.removedIndex
    const addedIndex = e.addedIndex
    const card = this.props.savedCard

    if (this.props.room.currentPlayer !== this.props.user.username || !this.props.room.currentPlayerHasGrabbedCard) { return false }
    if (addedIndex === null && removedIndex === null) { return false }
    const groupIndex = this.props.room.table.findIndex(group => group.id === id)

    let newGroup = {...this.props.room.table[groupIndex]}
    let newGroupCards = newGroup.cards

    if (removedIndex >= 0 && addedIndex === null) {
      newGroupCards.splice(removedIndex, 1)
      const isGroupEmpty = !newGroupCards.length
      this.props.sendToServer('remove card from group', {card, groupId: id, removedIndex})
    }

    if (addedIndex >= 0 && removedIndex === null) {
      newGroupCards.splice(addedIndex, 0, this.props.savedCard)
      this.props.sendToServer('add card to group', {card, groupId: id, addedIndex})
    }

    if (removedIndex !== null && addedIndex !== null) {
      // remove card
      newGroupCards.splice(removedIndex, 1)
      // add card to new place
      newGroupCards.splice(addedIndex, 0, card)

      let thisTable = this.props.room.table.slice()
      thisTable[groupIndex].cards = newGroupCards

      this.props.dispatch({
        type: "UPDATE_TABLE",
        table: thisTable
      })

      this.props.handleTableUpdate()
    }
  }

  handleTableGroupDragStart(index, e) {
    if (!e.isSource) {return false}
  }

  handleTableGroupDragEnd(index, e) {
  }

  handleTableGroupDragEnter(index) {
  }

  handleTableGroupDragLeave(index) {
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
        return null
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
          const numberOfCards = this.props.cards.length
          const maxWidth = 100/numberOfCards + '%'
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
                // onDragEnter={(e) => {this.handleTableGroupDragEnter(this.props.index)}}
                // onDragLeave={(e) => {this.handleTableGroupDragLeave(this.props.index)}}
                // onDrop={(e) => {this.handleTableGroupDrop(this.props.id, e)}}
                onDrop={(e) => {this.props.handleCardDrop(this.props.id, e)}}
                // onDropReady={(e) => {this.handleTableGroupDropReady(this.props.id, e)}}
              >
                {this.props.cards.map((card, index) => (
                  <Draggable key={index} className="inline-flex">
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
              onDragEnter={(e) => {this.handlePlayerDragEnter('player')}}
              onDragLeave={(e) => {this.handlePlayerDragLeave()}}
              onDrop={(e) => {this.props.handleCardDrop('player', e)}}
              onDropReady={(e) => {this.handleCardDropReady(this.props.index, e)}}
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
      return null
    }
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    room: state.room,
    savedCard: state.savedCard,
    toGroup: state.toGroup,
    fromGroup: state.fromGroup,
    savedGroupToIndex: state.savedGroupToIndex,
    savedGroupFromIndex: state.savedGroupFromIndex,
    savedGroupFromMinusOne: state.savedGroupFromMinusOne,
    cardMovement: state.cardMovement
  }
}

export default connect(mapStateToProps)(RenderCards)
