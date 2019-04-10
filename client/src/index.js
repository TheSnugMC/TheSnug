import React from "react"
import ReactDOM from "react-dom"
import {
  BrowserRouter as Router, Route, Switch
} from "react-router-dom"
import * as serviceWorker from "./serviceWorker"
import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import { Provider } from "react-redux"
import thunk from "redux-thunk"

import "typeface-sarabun"
import "./index.scss"

import Index from "main"
import Admin from "admin"

import { userReducer, queueReducer } from "admin/reducers"

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const reducer = combineReducers({
  user: userReducer,
  queue: queueReducer,
})
const store = createStore(
  reducer,
  composeEnhancer(applyMiddleware(thunk)),
)

const Navigator = () => (
  <Provider store={store}>
    <Router>
      <div id="router-root">
        <Switch>
          <Route path="/admin/" component={Admin} />
          <Route path="/" component={Index} />
        </Switch>
      </div>
    </Router>
  </Provider>
)

ReactDOM.render(<Navigator />, document.getElementById("root"))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
