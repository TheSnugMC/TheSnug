import { apiFetch } from "lib/util"

export const USER_UPDATED = "admin/user/update/SUCCESS"
export const USER_UPDATE_STARTED = "admin/user/update/LOADING"
export const USER_UPDATE_FAILED = "admin/user/update/FAILURE"

export const MOVIE_DELETE_STARTED = "admin/movie/delete/LOADING"
export const MOVIE_DELETE_FAILED = "admin/movie/delete/FAILURE"
export const MOVIE_DELETED = "admin/movie/delete/SUCCESS"

export const MOVIE_EDIT_STARTED = "admin/movie/edit/LOADING"
export const MOVIE_EDIT_FAILED = "admin/movie/edit/FAILURE"
export const MOVIE_EDITED = "admin/movie/edit/SUCCESS"

export const MOVIE_ADD_STARTED = "admin/movie/add/LOADING"
export const MOVIE_ADD_FAILED = "admin/movie/add/FAILURE"
export const MOVIE_ADDED = "admin/movie/add/SUCCESS"

export const QUEUE_LOAD_STARTED = "admin/queue/LOADING"
export const QUEUE_LOAD_FAILED = "admin/queue/FAILURE"
export const QUEUE_LOADED = "admin/queue/SUCCESS"

// direct actions

export const userUpdated = (user) => ({
  type: USER_UPDATED,
  user,
})

export const userUpdateStarted = () => ({
  type: USER_UPDATE_STARTED,
})

export const userUpdateFailed = (error) => ({
  type: USER_UPDATE_FAILED,
  error,
})

export const movieDeleteStarted = (id) => ({
  type: MOVIE_DELETE_STARTED,
  id,
})

export const movieDeleteFailed = (id) => ({
  type: MOVIE_DELETE_FAILED,
  id,
})

export const movieDeleted = (id) => ({
  type: MOVIE_DELETED,
  id,
})

export const movieEditStarted = (id) => ({
  type: MOVIE_EDIT_STARTED,
  id,
})

export const movieEditFailed = (id) => ({
  type: MOVIE_EDIT_FAILED,
  id,
})

export const movieEdited = (movie) => ({
  type: MOVIE_EDITED,
  movie,
})

export const movieAddStarted = (movie) => ({
  type: MOVIE_ADD_STARTED,
  movie,
})

export const movieAddFailed = (movie) => ({
  type: MOVIE_ADD_FAILED,
  movie,
})

export const movieAdded = (movie, newMovie) => ({
  type: MOVIE_ADDED,
  movie,
  newMovie, // replaces movie in the queue
})

export const queueLoadStarted = () => ({
  type: QUEUE_LOAD_STARTED,
})

export const queueLoadFailed = () => ({
  type: QUEUE_LOAD_FAILED,
})

export const queueLoaded = (queue) => ({
  type: QUEUE_LOADED,
  queue,
})

// helpers

export const loginUser = (username, password) => (dispatch) => { // thunk
  dispatch(userUpdateStarted())

  apiFetch(`/.api/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }).then(res => {
    if (res.ok) {
      return res.json()
    } else {
      res.json().then(({ error }) => dispatch(userUpdateFailed(error)))
    }
  }).then((user) => {
    dispatch(userUpdated(user))
  }).catch((err) => {
    dispatch(userUpdateFailed(err.toString()))
    console.log(err)
  })
}

export const deleteMovie = id => (dispatch) => { // thunk
  dispatch(movieDeleteStarted(id))

  apiFetch(`/.api/movie/${id}`, {
    method: "DELETE",
  }).then(res => {
    if (res.ok) {
      return res.json()
    } else {
      dispatch(movieDeleteFailed(id))
      res.json().then(data => alert(data.error))
    }
  }).then(() => dispatch(movieDeleted(id)))
  .catch((err) => {
    console.error(err)
    alert("An error occured.") // TODO
    dispatch(movieDeleteFailed(id))
  })
}

export const editMovie = movie => (dispatch) => { // thunk
  dispatch(movieEditStarted(movie.id))

  apiFetch(`/.api/movie/${movie.id}`, {
    method: "PUT",
    body: JSON.stringify({ movie }),
  }).then(res => {
    if (res.ok) {
      return res.json()
    } else {
      dispatch(movieEditFailed(movie.id))
    }
  }).then((data) => {
    dispatch(movieEdited(movie))
  }).catch((err) => {
    console.error(err)
    alert("An error occured.") // TODO
    dispatch(movieEditFailed(movie.id))
  })
}

export const addMovie = movie => (dispatch) => { // thunk
  dispatch(movieAddStarted(movie))

  apiFetch(`/.api/movies`, {
    method: "POST",
    body: JSON.stringify({ movie }),
  }).then((res) => {
    if (res.ok) {
      return res.json()
    } else {
      dispatch(movieAddFailed(movie))
    }
  }).then((newMovie) => {
    dispatch(movieAdded(movie, newMovie))
  }).catch((err) => {
    console.error(err)
    alert("An error occured.") // TODO
    dispatch(movieAddFailed(movie))
  })
}

export const loadQueue = () => (dispatch, getState) => {
  const { queue: { loaded } } = getState()
  if (loaded === true) return

  dispatch(queueLoadStarted())

  apiFetch("/.api/movies")
    .then(res => res.json())
    .then((data) => {
      dispatch(queueLoaded(data))
    })
    .catch((err) => {
      console.error(err)
      alert("An error occured loading the queue.") // TODO
      dispatch(queueLoadFailed())
    })
}
