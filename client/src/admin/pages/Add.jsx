import React, { useState } from "react" // eslint-disable-line
import { connect } from "react-redux"
import moment from "moment"
import _ from "lodash"

import AdminPage from "admin/containers/AdminPage"
import MovieEditor from "admin/components/MovieEditor"
import Button from "components/Button"

import { addMovie } from "admin/actions"

import "./Add.scss"

const Add = ({ adding, queue, onMovieAdded }) => {

  const onSubmit = (movie) => {
    onMovieAdded(movie)
  }

  const queueHelper = ({ setStartsAt, MOMENT_FORMAT }) => {
    const setToQueue = () => {
      if (queue.length === 0) {
        alert("Please load the queue (click Queue on the sidebar) before using this function.")
        return
      }

      const lastMovie = _(queue).sortBy("startsAt").last()
      setStartsAt(moment(lastMovie.startsAt).format(MOMENT_FORMAT))
    }

    return <Button onClick={setToQueue} type="success">
      Set start after last movie
    </Button>
  }

  return (
    <AdminPage title="Add a New Movie">
      { adding === true &&
          "Adding..."
      }
      {
        typeof adding === "string" &&
          adding // Error
      }
      <MovieEditor
        onSubmit={onSubmit}
        buttonText={adding === true ? "Adding..." : "Add Movie"}
        buttonDisabled={adding === true}
        customHelpers={[ queueHelper ]}
      />
    </AdminPage>
  )
}

const mapStateToProps = ({ queue: { adding, queue } }) => ({ adding, queue })
const mapDispatchToProps = (dispatch) => ({
  onMovieAdded(movie) {
    dispatch(addMovie(movie))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Add)
