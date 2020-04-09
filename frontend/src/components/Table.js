import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container } from 'react-smooth-dnd'

import RenderCards from './RenderCards'

class Table extends Component {
  constructor() {
    super()

    this.handleTableDrop = this.handleTableDrop.bind(this)
    this.handleTableEnter = this.handleTableEnter.bind(this)
    this.handleTableLeave = this.handleTableLeave.bind(this)

    //this.handleNewGroupEnter = this.handleNewGroupEnter.bind(this)
  }

  renderTableGroups() {
    return this.props.gameDb.table.map((group, index) => (
      <RenderCards
        key={index}
        index={index}
        cards={group}
        location='table'
        onClick={this.props.onClick}
        handleHandUpdate={(e) => this.props.handleHandUpdate(e)}
        handleTableUpdate={(e) => this.props.handleTableUpdate(e)}
      />
    ))
  }

  handleTableEnter() {
    console.log('enter table')
    this.props.dispatch({
      type: "SAVE_GROUP_TO_DROP",
      group: 'table'
    }) 
  }
  
  handleTableLeave() {
    console.log('adio table:')
    this.props.dispatch({
      type: "SAVE_GROUP_TO_DROP",
      group: null
    })
  }

  handleTableDrop(dragInfo, dropZone) {
    console.log('table dragInfo:', dragInfo)

    if (this.props.currentPlayer !== this.props.user.username) { return false }
    if (this.props.savedGroup !== 'table') { return false }

    if (dragInfo.removedIndex === null && dragInfo.addedIndex !== null) {
      let thisTable = this.props.gameDb.table.slice()
      let thisUserHand = this.props.user.hand.slice()

      for (let i in thisUserHand) {
        if (thisUserHand[i].id === this.props.savedCard.id) {
          thisUserHand.splice(i, 1)
        }
      }

      thisTable.push([this.props.savedCard])

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

      this.props.handleTableUpdate()
    }

  }







  handleTableEnter() {
    console.log('enter table')
    this.props.dispatch({
      type: "SAVE_GROUP",
      group: 'table'
    }) 
  }

  handleTableLeave() {
    console.log('leave table')
    this.props.dispatch({
      type: "SAVE_GROUP",
      group: 'none'
    }) 
  }




  render () {

    const handleNewGroupDrop = (dragInfo) => {
      const removedIndex = dragInfo.removedIndex
      const addedIndex = dragInfo.addedIndex

      if (!this.props.gameDb.currentPlayerHasGrabbedCard) { return false }
      if (this.props.gameDb.currentPlayer !== this.props.user.username) { return false }
      if (this.props.savedGroup !== 'table') { return false }

      const draggedCard = this.props.savedCard
      let thisTable = this.props.gameDb.table.slice()

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

      thisTable.push([draggedCard])

      this.props.dispatch({
        type: "UPDATE_TABLE",
        table: thisTable
      })

      this.props.dispatch({
        type: "SAVE_GROUP",
        group: 'none'
      }) 

      this.props.handleTableUpdate()
    }

    return (
      <div className="flex items-center justify-center w-full h-full">
        {this.props.userIsDragging &&
          <Container groupName='droppable' animationDuration={0} behaviour='drop-zone' onDragEnter={(e) => {this.handleTableEnter(e)}} onDragLeave={(e) => {this.handleTableLeave(e)}} onDrop={handleNewGroupDrop}>
            <div className="border-2 border-solid border-gray-300 px-1 py-3 mx-2">New group</div>
          </Container>
        }
        {this.props.gameDb.table && this.renderTableGroups()}
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
    isTableActive: state.isTableActive,
    savedCard: state.savedCard,
    savedGroup: state.savedGroup,

    userIsDragging: state.userIsDragging,
    draggedCard: state.draggedCard
  }
}

export default connect(mapStateToProps)(Table)
