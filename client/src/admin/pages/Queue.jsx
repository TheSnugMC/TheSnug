import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import update from "immutability-helper"
import moment from "moment"
import _ from "lodash"

import { deleteMovie, editMovie, loadQueue } from "admin/actions"

import Button from "components/Button"
import Checkbox from "components/Checkbox"
import EditableMovie from "admin/components/EditableMovie"

import AdminPage from "admin/containers/AdminPage"

import "./Queue.scss"

const groupByDay = (queue) => _(queue)
  .groupBy(m => moment(m.startsAt).startOf("day").format())
  .entries()
  .sortBy("0")
  .value()

const Queue = ({
  queue, loaded, onMovieEdited, onMovieDeleted, onQueueMounted,
}) => {
  const [selected, setSelected] = useState(new Set())
  const allSelected = queue.length !== 0 && selected.size === queue.length

  // load the queue up
  useEffect(onQueueMounted, [])

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(queue.map(movie => movie.id)))
    }
  }

  const toggleSelected = (id) => {
    setSelected((oldSelected) => update(oldSelected, {
      [!selected.has(id) ? "$add" : "$remove"]: [id],
    }))
  }

  const deleteSelected = () => {
    Array.from(selected).map(onMovieDeleted)
    setSelected(new Set())
  }

  const groupedQueue = groupByDay(queue)

  return (
    <AdminPage title="Queue">
      <div className="Queue__bulk-functions">
        <div className="Queue__selection">
          <Checkbox onToggle={toggleAll} checked={allSelected} />
          <span className="Queue__selection-count">
            {selected.size} selected
          </span>
        </div>

        <div className="Queue__actions">
          <Button type="danger" onClick={deleteSelected}>
            Delete
          </Button>
        </div>
      </div>

      <div className="Queue__list">
        { loaded === true &&
          groupedQueue.map(([day, movies]) =>
            <div className="Queue__day" key={day}>
              <div className="Queue__day-header">
                {moment(day).format("MMMM Do, YYYY")}
              </div>
              {
                _.sortBy(movies, "startsAt").map(movie =>
                  <EditableMovie key={movie.id}
                    onToggleSelected={toggleSelected} movie={movie}
                    selected={selected.has(movie.id)}
                    onEdit={onMovieEdited} onDelete={onMovieDeleted}
                  />
                )
              }
            </div>
          )
        }
        <div className="Queue__message">
          { loaded === false &&
              "There was an error loading the queue."
          }
          { loaded === null &&
              "Loading..."
          }
          { loaded === true && queue.length === 0 &&
              'There are no movies. Press "Add" on the navigation to add one.'
          }
        </div>
      </div>
    </AdminPage>
  )
}

const mapStateToProps = ({ queue: { queue, loaded } }) => ({ queue, loaded, })
const mapDispatchToProps = (dispatch) => ({
  onMovieDeleted(id) {
    dispatch(deleteMovie(id))
  },

  onMovieEdited(movie) {
    console.log("onMovieEdited", movie)
    dispatch(editMovie(movie))
  },

  onQueueMounted(queue) {
    dispatch(loadQueue(queue))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Queue)
