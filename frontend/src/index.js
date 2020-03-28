import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import './index.css';
import Welcome from './components/Welcome';
import App from './components/App';

import * as serviceWorker from './serviceWorker';

const Root = () => {
  return (
    <Router>
      <Switch>
        <Route path="/game">
          <App />
        </Route>
        <Route path="/">
          <Welcome />
        </Route>
      </Switch>
    </Router>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'));

serviceWorker.unregister();
