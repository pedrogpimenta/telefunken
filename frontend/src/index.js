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
  endpoint: 'localhost:4001/game',
  gameId: '',
  connectedUsers: [],
  user: {
    socketId: '',
    username: '',
    cards: 0
  },
  count: 10
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
    case 'SET_CONNECTEDUSERS':
      return {
        ...state,
        connectedUsers: action.value
      }
    case 'UPDATE_USER_INFO':
      return {
        ...state,
        user: {
          ...state.user,
          id: action.id,
          username: action.username,
          cards: action.userCards
        }
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
