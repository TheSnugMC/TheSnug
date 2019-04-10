import React from "react"
import PropTypes from "prop-types"

import "./AdminPage.scss"

const AdminPage = ({ children, title }) => (
  <div className="AdminPage">
    <div className="AdminPage__title">
      {title}
    </div>
    <div className="AdminPage__content">
      {children}
    </div>
  </div>
)
AdminPage.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
}

export default AdminPage
