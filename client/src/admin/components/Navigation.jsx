import React from "react"
import PropTypes from "prop-types"
import { NavLink } from "react-router-dom"

import "./Navigation.scss"

const NaviLink = (props) => (
  <NavLink {...props}
    className="Navigation__link"
    activeClassName="Navigation__link--highlighted"
  />
)

const createURL = (match, path) =>
  `${match.url}${match.url.endsWith("/") ? "" : "/"}${path}`

const Navigation = ({ match }) => (
  <div className="Navigation">
    <div className="Navigation__header">TheSnug</div>

    <NaviLink to={createURL(match, "queue/")}>Queue</NaviLink>
    <NaviLink to={createURL(match, "add/")}>Add</NaviLink>
    <NaviLink to="/" exact>Home</NaviLink>
  </div>
)

Navigation.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}

export default Navigation
