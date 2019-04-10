import React from "react"
import PropTypes from "prop-types"

import "./TextInput.scss"

const TextInput = ({
  onChange, onSubmit, value, type = "text", placeholder = "", ...props
}) => {
  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit(value)
    }
  }

  const onTextInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return <input
    {...props}
    className="TextInput"
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={onTextInputChange}
    onKeyPress={onKeyPress}
  />
}

TextInput.propTypes = {
  onChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
}

export default TextInput
