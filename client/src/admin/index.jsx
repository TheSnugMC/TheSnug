import React from "react"
import { connect } from "react-redux"
import { Route, Switch } from "react-router-dom"

import Navigation from "admin/components/Navigation"

import Login from "admin/pages/Login"
import Queue from "admin/pages/Queue"
import Add from "admin/pages/Add"

import "./index.scss"

const mapStateToProps = ({ user }) => ({ user })

export default connect(
  mapStateToProps,
  null,
)(({ match, user }) => (
  <div className="Admin">
    {user.username !== null
      ? <div className="Admin__layout">
          <Navigation match={match} />
          <Switch>
            <Route path={`${match.path}queue/`} component={Queue} />
            <Route path={`${match.path}add/`} component={Add} />
          </Switch>
        </div>
      : <Login />
    }
  </div>
))
