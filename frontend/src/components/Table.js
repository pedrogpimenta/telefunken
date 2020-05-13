import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container } from 'react-smooth-dnd'

import RenderCards from './RenderCards'

class Table extends Component {
  constructor() {
    super()

    this.handleNewGroupDrop = this.handleNewGroupDrop.bind(this)
  }

  // ------------------- 
  // user actions
  // ------------------- 

  handleNewGroupDrop(e) {
    const removedIndex = e.removedIndex
    const addedIndex = e.addedIndex
    const fromGroup = this.props.fromGroup
    const card = this.props.savedCard

    // stop if not for this group
    if (removedIndex === null && addedIndex === null) { return false }
    // stop if user hasn't grabbed card
    if (!this.props.room.currentPlayerHasGrabbedCard) { return false }
    // stop if user isn't current player
    if (this.props.room.currentPlayer !== this.props.user.username) { return false }

    this.props.sendToServer('new group', {card})
  }

  // ------------------- 
  // render functions
  // ------------------- 

  renderTableGroups() {
    return this.props.room.table.map((group, index) => (
      <RenderCards
        key={group.id}
        id={group.id}
        cards={group.cards}
        location='table'
        onClick={this.props.onClick}
        handleHandUpdate={(e) => this.props.handleHandUpdate(e)}
        handleCardDrop={(location, e) => this.props.handleCardDrop(location, e)}
        handleTableUpdate={(e) => this.props.handleTableUpdate(e)}
        sendToServer={(action, content) => this.props.sendToServer(action, content)}
      />
    ))
  }

  render () {
    return (
      <div className="relative flex flex-col  sm:flex-row sm:flex-wrap items-start justify-center w-full h-full pt-4">
        {this.props.room.table && 
          this.renderTableGroups()
        }
        {/* Show if user is dragging, is current player, has grabbed card, card comes from player */}
        {this.props.userIsDragging &&
          (this.props.user.username === this.props.room.currentPlayer) &&
          (this.props.room.currentPlayerHasGrabbedCard) &&
          <div className="absolute flex items-stretch top-0 left-0 w-full h-full pt-2 px-2">
            <Container
              style={{width: '100%'}}
              groupName='droppable'
              animationDuration={0}
              behaviour='drop-zone'
              onDrop={(e) => {this.props.handleCardDrop('table', e)}}
            >
              <div className="inline-flex items-end justify-center border-2 border-dashed border-gray-400 rounded-lg w-full h-full z-0 p-2 text-gray-400 font-semibold text-xl">Drop to table</div>
            </Container>
          </div>
        }
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
    savedCard: state.savedCard,
    toGroup: state.toGroup,
    fromGroup: state.fromGroup,

    userIsDragging: state.userIsDragging,
    draggedCard: state.draggedCard
  }
}

export default connect(mapStateToProps)(Table)
