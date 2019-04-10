import React from "react"
import PropTypes from "prop-types"
import moment from "moment"

import "./Movie.scss"

const StyledHour = ({ date }) => (
  <div className="StyledHour">
    <span className="StyledHour__hour">{date.format("HH")}</span>
    <span className="StyledHour__minute">{date.format("mm")}</span>
  </div>
)

const Movie = ({ movie }) => (
  <div className="Movie">
    <div className="Movie__hours">
      <span className="Movie__starts-at">
        <StyledHour date={moment(movie.startsAt)} />
      </span>
      <span className="Movie__ends-at">
        <StyledHour date={moment(movie.endsAt)} />
      </span>
    </div>
    <div className="Movie__title">
      {movie.title}
    </div>
    <a className="StreamIMDBInfo__link" rel="noreferrer noopener"
      target="_blank" href={`https://www.imdb.com/title/${movie.imdbId}`}>
      IMDB Link
    </a>
  </div>
)
Movie.propTypes = {
  movie: PropTypes.shape({
    startsAt: PropTypes.string.isRequired,
    endsAt: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imdbId: PropTypes.string.isRequired,
  }).isRequired,
}

export default Movie
