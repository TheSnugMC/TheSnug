import React, { useState, useEffect, useRef } from "react"
import getStreamData from "lib/stream"
// import HLS from "hls.js"

import { interp } from "lib/util"

import "./Stream.scss"

// Tolerance the syncr has for timestamp difference, in seconds.
const SYNCR_TOLERANCE = 5
// How often syncr will try syncing, in miliseconds.
const SYNCR_INTERVAL = 5000

// TODO
/*
      hls = new HLS({
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 5,
      })
      hls.attachMedia(videoRef)
      hls.on(HLS.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(stream.streamPath)

        hls.on(HLS.Events.MANIFEST_PARSED, (e, data) => {
          videoRef.play()
          setLoaded(true)
          setPlaying(true)
          setMuted(false)
          setVolume(videoRef.volume)
        })
      })

      hls.on(HLS.Events.ERROR, (e, data) => {
        const { type, details, fatal } = data
        console.log(type, details, fatal, data)
      })
    } else if (!stream || !stream.streamPath) {
      setLoaded(false)
      if (hls !== null) {
        hls.destroy()
        hls = null
      }
    }
*/

const zeroPad = (n) => n<10?`0${n}`:n.toString()
const formatTime = s => `${zeroPad(Math.floor(s/60))}:${zeroPad(Math.floor(s % 60))}`

const StreamControls = ({
  playing, muted, volume, time, duration, fullscreen,
  onPlayClick, onMuteClick, onVolumeBarClick, onFullscreenClick,
  visible,
}) => {
  const onMouseDown = (e) => {
    e.persist()

    const onMouseUp = () => {
      e.target.removeEventListener("mousemove", onVolumeBarClick, false)
    }

    onVolumeBarClick(e) // make single clicks work

    e.target.addEventListener("mousemove", onVolumeBarClick, false)
    document.addEventListener("mouseup", onMouseUp, false)
  }

  return (
    <div className={
      interp`StreamControls ${visible && "StreamControls--visible"}`}>
      <span className="StreamControls__playing" onClick={onPlayClick}>
        <i className={`fa fa-${playing ? "pause" : "play"}`}></i>
      </span>
      <span className="StreamControls__volume">
        <span className="StreamControls__volume__mute" onClick={onMuteClick}>
          <i className={`fa fa-volume-${muted ? "mute" : "up"}`}></i>
        </span>
        <span className="StreamControls__volume__slider"
          onMouseDown={onMouseDown}>
          <span className="StreamControls__volume__slider-overlay"
            style={{width: `${volume * 100}%`}}/>
        </span>
      </span>
      {
        time &&
          <span className="StreamControls__time">
            {formatTime(time)}
            /
            {formatTime(duration)}
          </span>
      }
      <span className="StreamControls__fullscreen" onClick={onFullscreenClick}>
        <i className={`fa fa-${!fullscreen ? "expand" : "compress"}`}></i>
      </span>
    </div>
  )
}

const StreamIMDBInfo = ({ imdbId }) => {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    fetch("/.api/imdb")
    .then(r => r.json())
    .then(setInfo)
    .catch(console.log)
  }, [imdbId])

  return (
    <div className="StreamIMDBInfo">
      {
        info !== null && <>
          <div className="StreamIMDBInfo__poster">
            <img src={info.poster} alt="Poster" />
          </div>
          <div className="StreamIMDBInfo__details">
            <h1 className="StreamIMDBInfo__title">
              {info.title} ({info.year})
            </h1>
            <p className="StreamIMDBInfo__plot">
              {info.plot}
            </p>
            <a href={`https://www.imdb.com/title/${imdbId}`}
               className="StreamIMDBInfo__link"
               target="_blank" rel="noopener noreferrer">
               IMDB Page
             </a>
          </div>
        </>
      }
    </div>
  )
}

const requestFullscreen = (el) => {
  el.requestFullscreen = (
    el.requestFullscreen
    || el.mozRequestFullScreen
    || el.webkitRequestFullscreen
    || el.msRequestFullscreen
  )
  return el.requestFullscreen()
}

const exitFullscreen = () => {
  document.exitFullscreen = (
    document.exitFullscreen
    || document.mozCancelFullScreen
    || document.webkitExitFullscreen
    || document.msExitFullscreen
  )
  document.exitFullscreen()
}

let timeoutId = null
const Stream = () => {
  const [stream, setStream] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [volume, setVolume] = useState(0.32333)
  const [time, setTime] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const videoRef = useRef(null)
  const videoContainerRef = useRef(null)
  const playingRef = useRef(playing) // hack 1/2 to use playing in videoSyncr
  const videoSyncrTimeoutId = useRef(null)
  const timeInterval = useRef(null)

  const checkStream = () => {
    timeoutId = setTimeout(checkStream, 10000)
    getStreamData()
      .then((data) => {
        setStream(data)
        setLoaded(true)
      })
      .catch(console.log)
  }

  // This code will automatically try to sync the video to the current time
  // every SYNCR_INTERVAL seconds.
  const videoSyncr = (force = false) => {
    const { current: video } = videoRef
    const { current: playing } = playingRef
    if (video)
      videoSyncrTimeoutId.current = setTimeout(videoSyncr, SYNCR_INTERVAL)

    if (!video || !stream || !stream.path || (!force && !playing)) return

    const currentTime = (new Date() - new Date(stream.startsAt)) / 1000

    if (video.currentTime < currentTime - SYNCR_TOLERANCE
      || video.currentTime > currentTime + SYNCR_TOLERANCE) {
      video.currentTime = currentTime
    }
  }

  const updateTime = () => {
    const { current: video } = videoRef
    if (!video) return
    setTime(video.currentTime)
  }

  // setup periodic stream checking
  useEffect(() => {
    checkStream()

    return function cleanup() {
      clearTimeout(timeoutId)
    }
  }, [])

  // update the playing ref once per render (hack 2/2)
  useEffect(() => {
    playingRef.current = playing
  })

  // load the video once the stream starts
  useEffect(() => {
    const { current: video } = videoRef

    if (video !== null) {
      if (stream && stream.path) {
        video.src = stream.path
        video.load()
        video.addEventListener("loadeddata", () => {
          videoSyncr(true)
          setPlaying(!video.paused)
          setMuted(video.muted)
          setVolume(video.volume)
        }, false)
      } else {
        if (videoSyncrTimeoutId.current !== null) {
          clearTimeout(videoSyncrTimeoutId.current)
          videoSyncrTimeoutId.current = null
        }
        
        if (timeInterval.current !== null) {
          clearTimeout(timeInterval.current)
          timeInterval.current = null
        }
      }
    }
  }, [stream ? stream.path : null])

  // set up the mousemove handler for control visibility
  useEffect(() => {
    const { current: videoContainer } = videoContainerRef
    if (!videoContainer) return

    let currentTimeout = null
    const handler = () => {
      setControlsVisible(true)
      if (currentTimeout) {
        clearTimeout(currentTimeout)
        currentTimeout = null
      }

      currentTimeout = setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }

    videoContainer.addEventListener("mousemove", handler, false)
    handler() // call once to kickstart the timeout

    return function cleanup() {
      videoContainer.removeEventListener("mousemove", handler, false)
    }
  }, [])

  // load the current time once a second
  useEffect(() => {
    timeInterval.current = setInterval(updateTime, 1000)

    return function cleanup() {
      clearInterval(timeInterval.current)
      timeInterval.current = null
    }
  }, [stream && stream.path])

  const onPlayClick = () => {
    const { current: video } = videoRef
    if (video) video[playing ? "pause" : "play"]()
    setPlaying(!playing)
  }

  const onMuteClick = () => {
    const { current: video } = videoRef
    if (video) video.muted = !muted
    setMuted(!muted)
  }

  const onVolumeBarClick = (e) => {
    const { current: video } = videoRef
    if (!video) return

    const barBoundBox = e.target.getBoundingClientRect()
    const volume = (e.clientX - barBoundBox.left) / barBoundBox.width
    video.volume = volume
    setVolume(volume)
  }

  const toggleFullscreen = () => {
    const { current: videoContainer } = videoContainerRef
    if (!videoContainer) return

    if (!fullscreen) {
      // XXX Promise.resolve because the vendor prefixed APIs don't return
      // promises :/
      (requestFullscreen(videoContainer) || Promise.resolve())
        .then(() => setFullscreen(true))
    } else {
      exitFullscreen()
      setFullscreen(false)
    }
  }

  // set up double click on the video to toggle fullscreen
  useEffect(() => {
    const { current: videoContainer } = videoContainerRef
    if (!videoContainer) return

    videoContainer.addEventListener("dblclick", toggleFullscreen, false)
    return function cleanup() {
      videoContainer.removeEventListener("dblclick", toggleFullscreen, false)
    }
  }) // replace on scene change because toggleFullscreen ref

  return (
    <div className="Stream">
      <div className="Stream__info">
        <span className="Stream__title">
          {loaded
            ? stream
              ? `Now playing: ${stream.title}`
              : "Currently offline"
            : "Loading..."
          }
        </span>

        {loaded && stream &&
          <span className="Stream__viewers">
            <strong>{stream ? stream.viewers : 0}</strong>
            {" watching"}
          </span>
        }
      </div>

      <div className={interp`Stream__video
        ${controlsVisible && "Stream__video--controls"}`}
        ref={videoContainerRef}>
        {stream && stream.path && <>
          <video autoPlay ref={videoRef}></video>
          <StreamControls
            {...{
              playing, muted, volume, time, duration: stream.duration,
              fullscreen,

              onPlayClick, onMuteClick, onVolumeBarClick,
              onFullscreenClick: toggleFullscreen,
              visible: controlsVisible,
            }}
          />
        </>}
      </div>

      <StreamIMDBInfo imdbId={stream ? stream.imdbId : null} />
    </div>
  )
}

export default Stream
