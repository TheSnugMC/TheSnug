import React, { useState } from "react"
import { Route, Switch, Link } from "react-router-dom"

import Index from "./pages/Index"
import StaticPage from "./pages/StaticPage"
import NotFound from "./pages/NotFound"

import "./index.scss"

const TopBar = ({ menu }) => (
  <div className="TopBar">
    <h1 className="TopBar__title">
      <Link to="/">TheSnug</Link>
    </h1>
    {
      menu.map(([name, cb], i) =>
        <div key={i} className="TopBar__option" onClick={cb}>{name}</div>)
    }
  </div>
)

const Footer = () => (
  <div className="Footer">
        This land is your land.
  </div>
)

const Layout = ({ children, menu = [] }) => {
  return (
    <div className="Layout">
      <TopBar menu={menu} />
      <div className="Layout__content">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default () => {
  const [schedule, setSchedule] = useState(false)

  const menuOptions = [
    ["Schedule", () => {
      setSchedule(oldSchedule => !oldSchedule)
    }],
  ]

  return (
    <Layout menu={menuOptions}>
      <Switch>
        <Route path="/:pageId.html" component={StaticPage} />
        <Route path="/" exact render={() =>
          <Index schedule={schedule} setSchedule={setSchedule} />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}
