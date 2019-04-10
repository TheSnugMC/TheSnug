import React from "react"

import Stream from "main/components/Stream"
import Chat from "main/components/Chat"
import Schedule from "main/components/Schedule"

import "./Index.scss"

export default ({ schedule, setSchedule }) => (
  <>
    <div className="Index__left-container">
      <Stream />
      <Schedule visible={schedule} setVisible={setSchedule} />
    </div>
    <Chat />
  </>
)
