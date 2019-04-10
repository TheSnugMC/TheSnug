import React from "react"
import { Link } from "react-router-dom"

import "./NotFound.scss"

export default () => (
  <div className="NotFound">
    <div className="NotFound__info">
      <div className="NotFound__title">404 Not Found</div>
      <div className="NotFound__home">
          <Link to="/">
              <i className="fa fa-arrow-left" />
              {" "}
              Go Home
          </Link>
      </div>
    </div>
    <div className="NotFound__figure">
    </div>
  </div>
)
