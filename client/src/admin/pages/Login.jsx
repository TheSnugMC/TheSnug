import React, { useState } from "react"
import { connect } from "react-redux"

import Box from "components/Box"
import TextInput from "components/TextInput"
import Button from "components/Button"

import { loginUser } from "admin/actions"

const Login = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = (e) => {
    onLogin(username, password)
  }

  return (
    <div className="Login">
      <Box title="Login">
        {typeof loading === "string" && loading}
        <TextInput
          placeholder="Username"
          value={username}
          onChange={setUsername}
          onSubmit={onSubmit} />
        <TextInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          onSubmit={onSubmit} />
        <Button onClick={onSubmit} disabled={loading === true}>
          {loading === true ? "Loading..." : "Login"}
        </Button>
      </Box>
    </div>
  )
}

const mapStateToProps = ({ user: { loading } }) => ({ loading })
const mapDispatchToProps = (dispatch) => ({
  onLogin(username, password) {
    dispatch(loginUser(username, password))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login)
