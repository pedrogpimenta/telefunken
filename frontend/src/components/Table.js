import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container } from 'react-smooth-dnd'

import RenderCards from './RenderCards'

class Table extends Component {
  // ------------------- 
  // render functions
  // ------------------- 

  renderTableGroups() {
    return this.props.room.table.map((group, index) => (
      <RenderCards
        key={group.id}
        id={group.id}
        groupCreator={group.groupCreator}
        cards={group.cards}
        location='table'
        onClick={this.props.onClick}
        handleCardDrop={(location, e) => this.props.handleCardDrop(location, e)}
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
    userIsDragging: state.userIsDragging,
  }
}

export default connect(mapStateToProps)(Table)
