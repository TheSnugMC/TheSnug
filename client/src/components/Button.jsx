import React from "react"
import PropTypes from "prop-types"

import "./Button.scss"

const Button = ({ type = "normal", ...props }) => (
  <button {...props} type="button" className={`Button Button--${type}`} />
)

Button.propTypes = {
  type: PropTypes.string,
}

export default Button
