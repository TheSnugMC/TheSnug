import React, { useState } from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

import Box from "components/Box"

import "./Modal.scss"

export const useModal = () => {
  const [visible, setVisible] = useState(false)
  const toggleVisible = () => setVisible(oldVisible => !oldVisible)

  return [visible, toggleVisible]
}

const Modal = ({ title, children, onClose }) => {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const onCloseModal = () => {
    document.body.removeChild(container)
    onClose()
  }

  return ReactDOM.createPortal(
    <div className="Modal">
      <div className="Modal__overlay" onClick={onCloseModal} />
      <Box title={title} onClose={onCloseModal}>{children}</Box>
    </div>,
    container,
  )
}
Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
}

export default Modal
