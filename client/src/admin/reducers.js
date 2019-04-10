import {
  USER_UPDATED, USER_UPDATE_STARTED, USER_UPDATE_FAILED,
  MOVIE_DELETE_STARTED, MOVIE_DELETE_FAILED, MOVIE_DELETED,
  MOVIE_EDIT_STARTED, MOVIE_EDIT_FAILED, MOVIE_EDITED,
  MOVIE_ADD_STARTED, MOVIE_ADD_FAILED, MOVIE_ADDED,
  QUEUE_LOAD_FAILED, QUEUE_LOAD_STARTED, QUEUE_LOADED,
} from "./actions"

export const userReducer = (state, action) => {
  if (typeof state === "undefined")
    return { username: null, loggedIn: false, loading: false }

  switch (action.type) { // eslint-disable-line default-case
    case USER_UPDATED:
      if (action.user != null) {
        return {
          ...state,
          username: action.user.username,
          loggedIn: action.user.loggedIn,
          loading: false,
        }
      } else {
        return {
          ...state,
          username: null,
          loggedIn: false,
          loading: false,
        }
      }
    case USER_UPDATE_FAILED:
      return {
        ...state,
        username: null,
        loggedIn: false,
        loading: action.error,
      }
    case USER_UPDATE_STARTED:
      return {
        ...state,
        loading: true,
      }
  }

  return state
}

const getMovie = (queue, id) => {
  const filteredQueue = queue.filter(movie => movie.id === id)
  if (!filteredQueue.length) {
    return [null, -1]
  }

  return [filteredQueue[0], queue.indexOf(filteredQueue[0])]
}

export const queueReducer = (state, action) => {
  if (typeof state === "undefined") {
    return {
      loaded: null,
      adding: false,
      queue: [],
    }
  }

  const { queue } = state

  const [movie, index] = getMovie(
    queue, action.id || (action.movie && action.movie.id) || null,
  )

  switch (action.type) { // eslint-disable-line default-case
    case MOVIE_DELETE_STARTED:
      if (!movie) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          { ...movie, deleting: true, },
          ...queue.slice(index+1),
        ]
      }
    case MOVIE_DELETE_FAILED:
      if (!movie) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          { ...movie, deleting: null, },
          ...queue.slice(index+1),
        ]
      }
    case MOVIE_DELETED:
      if (index === -1) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          ...queue.slice(index+1),
        ],
      }
    case MOVIE_EDIT_STARTED:
      if (!movie) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          { ...movie, editing: true, },
          ...queue.slice(index+1),
        ],
      }
    case MOVIE_EDIT_FAILED:
      if (!movie) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          { ...movie, editing: null, },
          ...queue.slice(index+1),
        ],
      }
    case MOVIE_EDITED:
      if (index === -1) break
      return {
        ...state,
        queue: [
          ...queue.slice(0, index),
          action.movie,
          ...queue.slice(index+1),
        ],
      }
    case MOVIE_ADD_STARTED:
      return {
        ...state,
        adding: true,
        queue: queue.concat(action.movie),
      }
    case MOVIE_ADD_FAILED: {
      const mIndex = queue.indexOf(action.movie)
      if (mIndex === -1) break
      return {
        ...state,
        adding: null,
        queue: queue.slice(0, mIndex).concat(queue.slice(mIndex+1)),
      }
    }
    case MOVIE_ADDED: {
      const mIndex = queue.indexOf(action.movie)
      if (mIndex === -1) break
      return {
        ...state,
        adding: false,
        queue: [
          ...queue.slice(0, mIndex),
          action.newMovie,
          ...queue.slice(mIndex+1),
        ]
      }
    }
    case QUEUE_LOAD_STARTED:
      return {
        ...state,
        loaded: null,
      }
    case QUEUE_LOADED:
      return {
        ...state,
        loaded: true,
        queue: action.queue,
      }
    case QUEUE_LOAD_FAILED:
      return {
        ...state,
        loaded: false,
      }
  }

  return state
}
