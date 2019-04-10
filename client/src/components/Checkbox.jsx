import React from "react"
import PropTypes from "prop-types"

import { interp } from "lib/util"

import "./Checkbox.scss"

const Checkbox = ({ onToggle, checked }) => {
  return (
    <div className="Checkbox__container">
      <div className={interp`Checkbox ${checked && "Checkbox--checked"}`}
           onClick={onToggle}>
        <div className="Checkbox__inner">
          <i className="fa fa-check" />
        </div>
      </div>
    </div>
  )
}
Checkbox.propTypes = {
  onToggle: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
}

export default Checkbox
