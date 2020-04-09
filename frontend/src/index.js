import React from 'react';
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

//import './index.css'
import './assets/main.css'

import App from './components/App'
import Welcome from './components/Welcome'

import * as serviceWorker from './serviceWorker'






import { Provider } from 'react-redux';
import { createStore } from 'redux'

const initialState = {
  endpoint: 'ef9dbac3.ngrok.io/game',
  gameId: '',
  connectedUsers: [],
  gameDb: {
    gameId: '',
    deck: [], // initial cards
    stock: [], // remaining cards for play
    discard: [],
    totalRounds: 6,
    currentRound: 1,
    direction: '', // clockwise/counterclockwise
    startingPlayer: '',
    currentPlayerTurn: '',
    table: [], // stores array of cards on table
    players: [ // keeps track of players and events
      {
        id: '',
        socketId: '',
        username: '',
        hand: [],
        buys: 6,
        totalPoints: 0,
        isOnline: true,
        events: [
          {
            roundNumber: 1, // number of the round
            buys: 0, // how many buys in this round
            points: 0 // if 0, player cut in this round
          }
        ]
      }
    ]
  },
  user: {
    socketId: '',
    username: '',
    cards: 0
  },
  userIsDragging: false,
  savedCard: 'none',
  savedGroup: 'none'
}

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
    case 'SET_GAMEID':
      return {
        ...state,
        gameId: action.gameId
      }
    case 'SET_USERNAME':
      return {
        ...state,
        user: {
          ...state.user,
          username: action.username
        }
      }
    case 'INCREMENT_USER_CARDS':
      return {
        ...state,
        user: {
          ...state.user,
          cards: state.user.cards + 1
        }
      }
    case 'UPDATE_GAME':
      return {
        ...state,
        gameDb: action.value
      }
    case 'UPDATE_USER_INFO':
      return {
        ...state,
        user: {
          ...state.user,
          id: action.id || state.user.id,
          username: action.username || state.user.username,
          isOnline: action.isOnline || state.user.isOnline,
          hand: action.hand || state.hand
        }
      }
    case 'USER_IS_SENDING_TO_TABLE':
      return {
        ...state,
        isTableActive: !state.isTableActive
      }
    case 'UPDATE_TABLE':
      return {
        ...state,
        gameDb: {
          ...state.gameDb,
          table: action.table
        }
      }
    case 'SAVE_DROPPED_CARD':
      return {
        ...state,
        savedCard: action.card
      }
    case 'SAVE_GROUP_TO_DROP':
      return {
        ...state,
        savedGroup: action.group
      }





    case 'SAVE_GROUP':
      return {
        ...state,
        savedGroup: action.group
      }
    case 'SAVE_CARD':
      return {
        ...state,
        savedCard: action.card
      }
    case 'USER_IS_DRAGGING':
      return {
        ...state,
        userIsDragging: true
      }
    case 'USER_IS_NOT_DRAGGING':
      return {
        ...state,
        userIsDragging: false
      }




    default:
      return state;
  }
}

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());







const Root = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/game/:gameId">
            <App />
          </Route>
          <Route path="/">
            <Welcome />
          </Route>
        </Switch>
      </Router>
    </Provider>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'))

serviceWorker.unregister()
