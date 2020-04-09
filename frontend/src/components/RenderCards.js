import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Draggable } from 'react-smooth-dnd'
import PlayingCard from './PlayingCard'

class RenderCards extends Component {
  render() {
    const handleStockCardClick = (e) => {
      this.props.onClick('stock', e)
    }

    const handleTableCardClick = (e) => {
      this.props.onClick('table', e)
    }

    const handleUserCardClick = (e) => {
      this.props.onClick('user', e)
    }

    const handleGroupEnter = () => {
      console.log('ola:', this.props.index)
      this.props.dispatch({
        type: "SAVE_GROUP_TO_DROP",
        group: this.props.index
      })
    }

    const handleGroupLeave = () => {
      console.log('adio:', this.props.index)
    }

    const handleGroupDrop = (dragInfo) => {
      if (this.props.savedGroup === 'table' || this.props.savedGroup === 'discard' || this.props.savedGroup === null ) { return false }

      let thisTable = this.props.gameDb.table.slice()
      let thisGroup = this.props.gameDb.table[this.props.savedGroup].slice()
      let thisUserHand = this.props.user.hand.slice()

      for (let i in thisUserHand) {
        if (thisUserHand[i].id === this.props.savedCard.id) {
          thisUserHand.splice(i, 1)
        }
      }

      thisGroup.push(this.props.savedCard)
      thisTable[this.props.savedGroup] = thisGroup

      this.props.dispatch({
        type: "UPDATE_TABLE",
        table: thisTable
      })

      this.props.dispatch({
        type: "UPDATE_USER_INFO",
        id: this.props.user.id,
        username: this.props.user.username,
        isOnline: this.props.user.isOnline,
        hand: thisUserHand
      })

      this.props.dispatch({
        type: "SAVE_GROUP_TO_DROP",
        group: null
      })
    }








    const handlePlayerCardDrag = (dragInfo) => {
      const removedIndex = dragInfo.removedIndex
      const addedIndex = dragInfo.addedIndex

      let currentCards = this.props.cards.slice()
      let draggedCard = currentCards[removedIndex]

      // save card to state
      this.props.dispatch({
        type: "SAVE_CARD",
        card: draggedCard
      })

      // stop if card is dragged out of Player's hand
      if (addedIndex === null) { return false }

      // remove card
      currentCards.splice(removedIndex, 1)
      // add card to new place
      currentCards.splice(addedIndex, 0, draggedCard)

      // save hand to state
      this.props.dispatch({
        type: "UPDATE_USER_INFO",
        username: this.props.user.username,
        id: this.props.user.id,
        hand: currentCards 
      }) 

      this.props.dispatch({
        type: 'SAVE_GROUP',
        group: 'none'
      }) 

      // save hand on server
      this.props.handleHandUpdate()
    }

    const handleUserDragStart = (dragInfo) => {
      this.props.dispatch({ type: 'USER_IS_DRAGGING' })
    }
    const handleUserDragEnd = (dragInfo) => {
      this.props.dispatch({ type: 'USER_IS_NOT_DRAGGING' })
    }









    const handleTableGroupCardDrag = (index, dragInfo) => {
      const removedIndex = dragInfo.removedIndex
      const addedIndex = dragInfo.addedIndex
      let thisTable = this.props.gameDb.table.slice()
      const savedGroup = this.props.savedGroup

      if (!this.props.gameDb.currentPlayerHasGrabbedCard) { return false }
      if (this.props.gameDb.currentPlayer !== this.props.user.username) { return false }
      if (savedGroup.substring(0, 5) !== 'group') { return false }

      const thisGroupIndex = parseInt(savedGroup.substring(5, savedGroup.length + 1))
      console.log('thisGroupIndex:', thisGroupIndex, 'index:', index)
      if (thisGroupIndex !== index) { return false }

      const savedCard = this.props.savedCard

      console.log('this index:', index)
      console.log('savedCard:', savedCard)
      console.log('TABLE GROUP DRAG ' + thisGroupIndex + ': removedIndex:', removedIndex, 'addedIndex:', addedIndex)

      let thisGroupArray = this.props.gameDb.table[thisGroupIndex].slice()

      // add card to new place
      thisGroupArray.splice(addedIndex, 0, savedCard)
      thisTable[index] = thisGroupArray 

      this.props.dispatch({
        type: "UPDATE_TABLE",
        table: thisTable
      })

      this.props.handleTableUpdate()

      // remove card from player's hand
      let playerCards = this.props.user.hand.slice()
      const cardIndex = playerCards.findIndex((card) => card.id === this.props.savedCard.id)
      playerCards.splice(cardIndex, 1)

      // save hand to state
      this.props.dispatch({
        type: "UPDATE_USER_INFO",
        username: this.props.user.username,
        id: this.props.user.id,
        hand: playerCards 
      }) 
      // save hand on server
      this.props.handleHandUpdate()
      
      this.props.dispatch({
        type: 'SAVE_GROUP',
        group: 'none'
      }) 

    }

    const handleTableGroupDragEnter = (index) => {
      console.log('enter group:', `group${index}`)
      this.props.dispatch({
        type: 'SAVE_GROUP',
        group: `group${index}`
      }) 
    }
    const handleTableGroupDragLeave = () => {
      console.log('leave group:')
      this.props.dispatch({
        type: 'SAVE_GROUP',
        group: 'none'
      }) 
    }



    








    const handleDrop = (dragInfo) => {
      console.log('dragInfo:', dragInfo)
      const removedIndex = dragInfo.removedIndex
      const addedIndex = dragInfo.addedIndex

      let prevCards = this.props.cards
      let nextCards = prevCards.slice()

      const movedCard = prevCards[removedIndex]

      if (addedIndex !== null && removedIndex !== null) {
        for (let i in prevCards) {
          if (removedIndex < addedIndex) {
            if (i > removedIndex && i <= addedIndex) {
              const thisCard = prevCards[i] 
              nextCards[i - 1] = thisCard
            } else {
              nextCards[i] = prevCards[i]
            }
          } else if (addedIndex < removedIndex) {
            if (i > addedIndex && i <= removedIndex) {
              const thisCard = prevCards[i - 1] 
              nextCards[i] = thisCard
            } else {
              nextCards[i] = prevCards[i]
            }
          } else {
            nextCards = prevCards
          }
        }

        nextCards[addedIndex] = movedCard

        this.props.dispatch({
          type: "UPDATE_USER_INFO",
          id: this.props.user.id,
          username: this.props.user.username,
          isOnline: true,
          hand: nextCards
        })
      } else {
        let thisCard = prevCards[removedIndex]

        this.props.dispatch({
          type: "SAVE_DROPPED_CARD",
          card: thisCard
        })

      }


      this.props.handleHandUpdate()
    }

    switch(this.props.location) {
      case 'discard':
        if (!!this.props.cards) {
          return this.props.cards.map(card => <PlayingCard
            key={card.id}
            id={card.id}
            value={card.value}
            suit={card.suit}
            type={this.props.location}
            onClick={(e) => {}}
          />)
        }
        return null
      case 'stock':
        return <PlayingCard
            value={this.props.cards}
            type={this.props.location}
            onClick={(e) => handleStockCardClick(e)}
          />
      case 'other players':
        const cardsLength = this.props.cards.length
        return this.props.cards.map((card, i) => {
          let showCardsLength = 0
          if (this.props.cards.length === i + 1) {
            showCardsLength = (this.props.cards.length === i + 1) ? cardsLength : 0
          }
          return (
            <PlayingCard
              key={card.id}
              id={card.id}
              value={showCardsLength}
              suit={card.suit}
              type={this.props.location}
              onClick={(e) => null}
            />)
          })
      case 'table':
        if (!!this.props.cards) {
          const numberOfCards = this.props.cards.length
          const maxWidth = 100/numberOfCards + '%'
          return (
            <div className="border-2 border-solid border-gray-300 mx-2">
              <Container key={this.props.index} style={{display: 'flex', maxWidth: '100vw', flexWrap: 'wrap'}} orientation='horizontal' groupName='droppable' onDragEnter={(e) => {handleTableGroupDragEnter(this.props.index)}} onDragLeave={(e) => {handleTableGroupDragLeave()}} onDrop={(e) => {handleTableGroupCardDrag(this.props.index, e)}}>
                {this.props.cards.map((card, index) => (
                  <Draggable key={index} className="inline-flex" style={{maxWidth: maxWidth}}>
                    <PlayingCard
                      key={card.id}
                      id={card.id}
                      value={card.value}
                      suit={card.suit}
                      selected={card.selected}
                      onClick={(e) => handleTableCardClick(e)}
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
            <Container style={{display: 'flex', maxWidth: '100vw', flexWrap: 'wrap'}} orientation='horizontal' groupName='droppable' onDrop={handlePlayerCardDrag} onDragStart={handleUserDragStart} onDragEnd={handleUserDragEnd}>
              {this.props.cards.map((card, index) => (
                <Draggable key={index} className="inline-flex" style={{maxWidth: maxWidth}}>
                  <PlayingCard
                    key={card.id}
                    id={card.id}
                    value={card.value}
                    suit={card.suit}
                    selected={card.selected}
                    onClick={(e) => handleUserCardClick(e)}
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
    gameDb: state.gameDb,
    savedCard: state.savedCard,
    savedGroup: state.savedGroup
  }
}

export default connect(mapStateToProps)(RenderCards)
