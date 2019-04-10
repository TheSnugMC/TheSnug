import React from "react"
import PropTypes from "prop-types"

import "./Box.scss"

const Box = ({ children, title, onClose }) => (
  <div className="Box">
    <div className={`Box__title ${onClose ? "Box__title__closable" : ""}`}>
      {title}
      {onClose &&
        <div className="Box__close" onClick={onClose}>
          <i className="fa fa-times" />
        </div>
      }
    </div>
    <div className="Box__content">
      {children}
    </div>
  </div>
)

Box.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.any.isRequired,
  onClose: PropTypes.func,
}

export default Box
