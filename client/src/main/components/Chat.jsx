import React, { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import update from "immutability-helper" 

import "./Chat.scss"

export const ChatMessage = ({ message }) => (
  <div className="ChatMessage">
    <span className="ChatMessage__info">
      {
        message.type === "chat" &&
        <>
          <span className="ChatMessage__date">
            {message.date.getHours()}:{message.date.getMinutes()}
          </span>
          <span className="ChatMessage__username">
            {message.username}
          </span>
        </>
      }
      {
        message.type === "info" &&
          <span className="ChatMessage__body">
            <em>{message.info}</em>
          </span>
      }
    </span>
    {
      message.type === "chat" &&
      <span className="ChatMessage__body">
        {message.message}
      </span>
    }
  </div>
)

const ChatRoster = ({ users }) => {
  const [enabled, setEnabled] = useState(false)

  const onClick = () => {
    setEnabled((oldEnabled) => !oldEnabled)
  }

  return (
    <div className="ChatRoster">
      <div className="ChatRoster__button" title="Roster" onClick={onClick}>
        <i className="fa fa-user"></i> Roster
      </div>
      <div className={
        `ChatRoster__dropdown ${enabled ? "ChatRoster__dropdown--enabled" : ""}`
      }>
        <ul className="ChatRoster__users">
          {users.size > 0
            ? Array.from(users).map(user => <li key={user}>{user}</li>)
            : <li><em>There are no users.</em></li>
          }
        </ul>
      </div>
    </div>
  )
}

export const ChatPopups = ({ popups, removePopup }) => (
  <div className="ChatPopups">
    {
      popups.map(popup =>
        <div
          className={`ChatPopups__child ChatPopups__child--${popup.level}`}
          key={popup.id}
          onClick={() => removePopup(popup.id)}>
          <span className="ChatPopups__child__message">{popup.message}</span>
        </div>
      )
    }
  </div>
)


export const ChatComposer = ({ onSubmit }) => {
  const [message, setMessage] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef !== null)
      inputRef.current.focus()
  }, [inputRef.current])

  const sendMessage = () => {
    onSubmit(message, (success) => {
      if (success) setMessage("")
    })
  }

  const onKeyPress = (e) => {
    if (e.key === "Enter")
      sendMessage()
  }

  const onChange = (e) => {
    setMessage(e.target.value)
  }

  return (
    <>
      <input
        type="text" className="Chat__compose__input"
        placeholder="Enter a message..."
        value={message}
        onChange={onChange}
        onKeyPress={onKeyPress}
        ref={inputRef}
        tabIndex={0}
      />
      <button className="Chat__compose__send" onClick={sendMessage}>
        Send
      </button>
    </>
  )
}

export const ChatNickname = ({ nickname, setNickname, onSubmit }) => {
  const onKeyPress = (e) => {
    if (e.key === "Enter")
      onSubmit()
  }

  const onChange = (e) => {
    setNickname(e.target.value)
  }

  return (
    <>
      <input
        type="text"
        className="Chat__compose__input Chat__compose__input--nickname"
        placeholder="Choose a nickname..."
        value={nickname}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
      <button className="Chat__compose__send Chat__compose__send--nickname"
        onClick={onSubmit}>Join</button>
    </>
  )
}

const socket = io()
const Chat = () => {
  const [messages, setMessages] = useState([])
  const [nickname, setNickname] = useState("")
  const [joined, setJoined] = useState(false)
  const [users, setUsers] = useState(new Set())
  const [popups, setPopups] = useState([])

  const addMessage = (messageData) => {
    setMessages((oldMessages) => update(oldMessages, {$push: [messageData]}))
  }

  const addPopup = (message, level = "info") => {
    setPopups((oldPopups) => update(oldPopups, {$push: [{
      id: +new Date(),
      message,
      level,
    }]}))
  }

  const removePopup = (id) => {
    setPopups((oldPopups) => oldPopups.filter(popup => popup.id !== id))
  }

  const addUser = (nick) => 
      setUsers((oldUsers) => update(oldUsers, {$add: [nick]}))

  const removeUser = (nick) => 
      setUsers((oldUsers) => update(oldUsers, {$remove: [nick]}))

  const onSubmitNickname = (n = nickname) => {
    socket.emit("nickname", n, (success) => {
      if (success) {
        addUser(n)
        setJoined(true)
      }
    })
  }

  // fetch roster
  useEffect(() => {
    fetch("/.api/roster")
      .then(r => r.json())
      .then(users => setUsers((oldUsers) => new Set([...oldUsers, ...users])))
      .catch((e) => {
        console.error(e)
        addPopup("Error loading roster", "error")
      })
  }, [])
    
  // this is used to grab the current nickname (for re-connects)
  const nicknameRef = useRef("")
  useEffect(() => { nicknameRef.current = nickname }, [nickname])
  // grab the joined state in the callbacks
  const joinedRef = useRef("")
  useEffect(() => { joinedRef.current = joined }, [joined])

  // setup socket listeners
  useEffect(() => {
    socket.on("join", (nick) => {
      addMessage({
        date: new Date(),
        type: "info",
        info: `${nick} joined`
      })
      addUser(nick)
    })

    socket.on("part", (nick) => {
      addMessage({
        date: new Date(),
        type: "info",
        info: `${nick} left`
      })
      removeUser(nick)
    })

    socket.on("nick error", (type, msg) => {
      const { current: joined } = joinedRef
      if (type === "taken" && joined)
        setJoined(false)
      addPopup(msg, "error")
    })

    socket.on("chat error", (type, msg) => {
      const { current: nickname } = nicknameRef
      if (type === "nonick" && nickname !== "") {
        onSubmitNickname(nickname)
        addPopup("Reconnected. Please re-send message.", "info")
      } else {
        addPopup(msg, "error")
      }
    })

    socket.on("chat message", (messageData) => {
      messageData.date = new Date(messageData.date)
      addMessage(messageData)
    })
  }, [socket])

  // scroll to the bottom of the page when new messages are added
  const messagesRef = useRef()
  useEffect(() => {
    const { current: messageDiv } = messagesRef
    if (messageDiv !== null && messageDiv.lastChild)
      messageDiv.lastChild.scrollIntoView()
  }, [messages.length])

  const onSubmitMessage = (message, cb) => {
    socket.emit("chat message", message, cb)
  }
  
  return (
    <div className="Chat">
      <div className="Chat__buttons">
        <ChatRoster users={users} />
      </div>
      <ChatPopups popups={popups} removePopup={removePopup} />
      <div className="Chat__messages" ref={messagesRef}>
        {messages.map(message =>
          <ChatMessage key={+message.date} message={message} />)}
      </div>
      <div className="Chat__compose">
        {joined
            ? <ChatComposer onSubmit={onSubmitMessage} />
            : <ChatNickname {...{
                nickname, setNickname, onSubmit: onSubmitNickname}} />
        }
      </div>
    </div>
  )
}

export default Chat
