// import packages
import React from 'react'
import {
  Switch,
  Route,
  useLocation
} from 'react-router-dom'

import useAckee from 'use-ackee'

import App from './App'
import Welcome from './Welcome'

// Making the App component
function Content(props) {
  const location = useLocation()

  useAckee(location.pathname, {
    server: 'https://analytics.pimenta.co',
    domainId: '4c2a5b7b-03a4-4248-b6a6-3e13877d77af'
  }, {
    ignoreLocalhost: true,
    detailed: true
  })

  return (
    <Switch>
      <Route path="/game/:gameId">
        <App />
      </Route>
      <Route path="/">
        <Welcome />
      </Route>
    </Switch>
  )
}

export default Content