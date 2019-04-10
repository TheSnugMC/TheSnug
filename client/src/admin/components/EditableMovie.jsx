import React from "react"
import PropTypes from "prop-types"

import Movie from "components/Movie"
import Checkbox from "components/Checkbox"
import Button from "components/Button"
import Modal from "components/Modal"
import MovieEditor from "admin/components/MovieEditor"

import { useToggle, interp } from "lib/util"

import "./EditableMovie.scss"

const EditableMovie = ({
  onToggleSelected, movie, selected, onEdit, onDelete,
}) => {
  const [editShown, toggleEdit] = useToggle()
  const [deleteShown, toggleDelete] = useToggle()

  const onEditSubmit = (m) => {
    onEdit(m)
    toggleEdit()
  }

  const onDeleteSubmit = () => {
    onDelete(movie.id)
    toggleDelete()
  }

  return (
    <div className={interp`EditableMovie
      ${(movie.editing || movie.deleting) && "EditableMovie--loading"}`}>
      <div className="EditableMovie__selection">
        <Checkbox checked={selected} onToggle={() => onToggleSelected(movie.id)} />
      </div>
      <Movie movie={movie} />
      <div className="EditableMovie__actions">
        <Button onClick={toggleEdit}>Edit</Button>
        <Button type="danger" onClick={toggleDelete}>Delete</Button>
      </div>
      { editShown &&
          <Modal title="Edit Movie" onClose={toggleEdit}>
            <MovieEditor movie={movie} onSubmit={onEditSubmit} buttonText="Submit" />
          </Modal>
      }
      {
        deleteShown &&
          <Modal title="Are you sure?" onClose={toggleDelete}>
            <strong>Are you sure you want to delete "{movie.title}"?</strong>
            <Button type="danger" onClick={onDeleteSubmit}>Delete</Button>
          </Modal>
      }
    </div>
  )
}
EditableMovie.propTypes = {
  onToggleSelected: PropTypes.func.isRequired,
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default EditableMovie
