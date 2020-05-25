import React from 'react';
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

// redux for state
import { createStore } from 'redux'
import { Provider } from 'react-redux';

// CSS & tailwind
import './assets/main.css'

// service workers (came with create-react-app)
import * as serviceWorker from './serviceWorker'

// my components
import App from './components/App'
import Welcome from './components/Welcome'

const endpoint = process.env.REACT_APP_HEROKU_SOCKET_ENDPOINT || '//localhost:4001/game'

// define initial state 
const initialState = {
  endpoint: endpoint,
  room: {
    name: '',
    deck: [], // initial cards
    stock: [], // remaining cards for play
    discard: [],
    totalRounds: 6,
    currentRound: 1,
    rounds: [],
    direction: '', // clockwise/counterclockwise
    startingPlayer: '',
    currentPlayer: '',
    table: [], // stores array of cards on table
    connectedUsers: [],
    players: [] // keeps track of players and events
  },
  user: {
    username: ''
  },
  userIsDragging: false,
  savedCard: 'none',
  fromGroup: 'none',
  toGroup: 'none',
  minusOne: 0,
  playerWantsToBuy: '',
  timer: 0
}

// define reducers
function reducer(state = initialState, action) {
  const newState = {...state}

  switch(action.type) {
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

    case 'UPDATE_GAME':
      return {
        ...state,
        room: action.value,
      }

    case 'UPDATE_USER_INFO':
      return {
        ...state,
        room: { 
          ...state.room,
          players: state.room.players.map(player => player.name === action.username ?
              {...player, hand: action.hand} : player
            )
        }
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

    case 'MOVEMENT_INFO':
      return {
        ...state,
        cardMovement: {
          ...state.cardMovement,
          from: action.from ?? state.cardMovement?.from,
          to: action.to ?? state.cardMovement?.to,
          fromPosition: action.fromPosition ?? state.cardMovement?.fromPosition,
          toPosition: action.toPosition ?? state.cardMovement?.toPosition
        }
      }

    case 'CLEAR_MOVEMENT_INFO':
      return {
        ...state,
        cardMovement: null
      }

    case 'UPDATE_DISCARD':
      newState.room.discard = action.value

      return newState

    case 'UPDATE_TABLE':
      newState.room.table = action.value

      return newState

    case 'UPDATE_COOLDOWN_TIME':
      return {
        ...state,
        turnCooldown: action.turnCooldown
      }

    default:
      return state;
  }
}

// create store & enable redux dev tools
const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

// root component
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
