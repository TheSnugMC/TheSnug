import React, { useState } from "react"
import PropTypes from "prop-types"
import moment from "moment"

import TextInput from "components/TextInput"
import Button from "components/Button"

import { apiFetch } from "lib/util"

import "./MovieEditor.scss"

const MOMENT_FORMAT = "YYYY-MM-DD HH:mm"
const formatEndDate = (startDate, duration) => {

  const start = moment(startDate, MOMENT_FORMAT)
  const dur = moment.duration(`00:${duration}`)

  return (start.isValid() && dur.isValid())
    ? start.clone().add(dur).format(MOMENT_FORMAT)
    : ""
}

const formatDuration = (duration) => {
  const dur = moment.duration(duration, "s")

  return `${Math.floor(dur.asMinutes())}:${Math.floor(dur.asSeconds() % 60)}`
}

const MovieEditor = ({
  movie, onSubmit, buttonText, buttonDisabled = false,
  customHelpers = null,
}) => {
  const [title, setTitle] = useState(movie ? movie.title : "")
  const [imdbId, setImdbId] = useState(movie ? movie.imdbId : "")
  const [path, setPath] = useState(movie ? movie.path : "")
  const [startsAt, setStartsAt] = useState(
    moment(movie ? movie.startsAt : undefined).format(MOMENT_FORMAT),
  )
  const [duration, setDuration] = useState(
    movie ? formatDuration(movie.duration) : "",
  )
  const endsAt = formatEndDate(startsAt, duration)

  const [fetchingIMDB, setFetchingIMDB] = useState(false)
  const [fetchingFfmpeg, setFetchingFfmpeg] = useState(false)

  const onSubmitMovie = () => {
    onSubmit({
      ...(movie ? movie : {}),
      title, imdbId, path,
      startsAt: moment(startsAt, MOMENT_FORMAT).format(),
      duration: moment.duration(`00:${duration}`).asSeconds(),
      endsAt: moment(endsAt, MOMENT_FORMAT).format(),
    }, (success) => {
      if (success) {
        setTitle("")
        setImdbId("")
        setPath("")
        setStartsAt(moment().format(MOMENT_FORMAT))
        setDuration("")
      }
    })
  }

  const fetchImdbData = () => {
    setFetchingIMDB(true)
    apiFetch("/.api/fetch/imdb", {
      method: "POST",
      body: JSON.stringify({ title })
    }).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        res.json().then(({ error }) => { throw error })
      }
    }).then(({ id, title: newTitle, runtime }) => {
      setFetchingIMDB(false)
      setTitle(newTitle)
      setImdbId(id)

      if (duration === "")
        setDuration(`${runtime}:00`)
    }).catch((err) => {
      console.log(err)
      window.alert("An error occured while fetching IMDB.")
    })
  }

  const fetchFfmpegDuration = () => {
    if (path === "") {
      window.alert("You must enter a URL.")
      return
    }

    setFetchingFfmpeg(true)
    apiFetch("/.api/fetch/ffmpeg", {
      method: "POST",
      body: JSON.stringify({ path })
    }).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        res.json().then(({ error }) => { throw error })
      }
    }).then(({ duration }) => {
      setFetchingFfmpeg(false)
      setDuration(duration)
    }).catch((err) => {
      console.log(err)
      window.alert("An error occured while fetching the duration.")
    })
  }

  return (
    <div className="MovieEditor">
      <div className="MovieEditor__movie-info">
        <TextInput placeholder="Title"
          value={title} onChange={setTitle}
          onSubmit={onSubmitMovie} />
        <TextInput placeholder="IMDB ID"
          value={imdbId} onChange={setImdbId}
          onSubmit={onSubmitMovie} />
      </div>
      <div className="MovieEditor__url">
        <TextInput placeholder="Video URL (Direct Link)"
          value={path} onChange={setPath}
          onSubmit={onSubmitMovie} />
      </div>
      <div className="MovieEditor__date">
        <TextInput
          placeholder="Start Date (YYYY-MM-DD HH:MM:SS)"
          value={startsAt} onChange={setStartsAt}
          onSubmit={onSubmitMovie} />
        <TextInput
          placeholder="Duration (MM:SS)"
          value={duration} onChange={setDuration}
          onSubmit={onSubmitMovie} />

        <TextInput disabled placeholder="End Date (Auto)"
          value={endsAt} onSubmit={() => {}} />
      </div>

      <div className="MovieEditor__helpers">
        <Button onClick={fetchImdbData} disabled={fetchingIMDB} type="success">
          {fetchingIMDB
            ? "Fetching..."
            : "Fetch title/duration/ID from IMDB"
          }
        </Button>

        <Button onClick={fetchFfmpegDuration} disabled={fetchingFfmpeg} type="success">
          {fetchingFfmpeg
            ? "Fetching..."
            : "Fetch duration from video"
          }
        </Button>

        {customHelpers && customHelpers.map(helper => helper({
          title, imdbId, path, startsAt, duration,
          setTitle, setImdbId, setPath, setStartsAt, setDuration,
          onSubmit: onSubmitMovie, MOMENT_FORMAT,
        }))}
      </div>

      <Button disabled={buttonDisabled} onClick={onSubmitMovie}>
        {buttonText}
      </Button>
    </div>
  )
}
MovieEditor.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string.isRequired,
    imdbId: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    startsAt: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonDisabled: PropTypes.bool,
  customHelpers: PropTypes.arrayOf(PropTypes.func),
}

export default MovieEditor
