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






// define initial state 
const initialState = {
  endpoint: 'localhost:4001/game',
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
  playerWantsToBuy: ''
}

// define reducers
function reducer(state = initialState, action) {
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
        room: action.value
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
        // user: {
        //   ...state.user,
        //   id: action.id || state.user.id,
        //   username: action.username || state.user.username,
        //   isOnline: action.isOnline || state.user.isOnline,
        //   hand: action.hand || state.hand
        // }
        // }
    case 'UPDATE_TABLE':
      return {
        ...state,
        room: {
          ...state.room,
          table: action.table
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

    case 'SAVE_CARD':
      return {
        ...state,
        savedCard: action.card
      }
    case 'SAVE_GROUP_TO':
      return {
        ...state,
        toGroup: action.group
      }
    case 'SAVE_GROUP_FROM':
      return {
        ...state,
        fromGroup: action.group
      }
    case 'SAVE_GROUP_TO_INDEX':
      return {
        ...state,
        savedGroupToIndex: action.savedGroupToIndex
      }
    case 'SAVE_GROUP_FROM_INDEX':
      return {
        ...state,
        savedGroupFromIndex: action.savedGroupFromIndex
      }
    case 'SAVE_GROUP_TO_MINUS_ONE':
      return {
        ...state,
        savedGroupFromMinusOne: action.minusOne
      }
    case 'PLAYER_WANTS_TO_BUY':
    console.log('reducer want to buy')
      return {
        ...state,
        playerWantsToBuy: action.value
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
