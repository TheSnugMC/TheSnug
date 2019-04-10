import React, { useState, useEffect } from "react"
import moment from "moment"
import _ from "lodash"

import { interp, range } from "lib/util"

import Movie from "components/Movie"

import "./Schedule.scss"

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
]
const ScheduleCalendar = ({ date: m, onDateSelect }) => (
  <div className="ScheduleCalendar">
    {
      /**
       * range(...) counts the days before the day of week the 1st of the month
       * is.
       * For instance, if the first of the month is a Thursday (4), this counts
       * 3 days.
       */
      range(m.clone().startOf("month").isoWeekday() - 1).map(i =>
        <div key={i}
          className="ScheduleCalendar__tile ScheduleCalendar__tile--empty" />
      )
    }
    {range(m.daysInMonth()).map(i =>
      <div className={interp`ScheduleCalendar__tile
        ${m.date() > i+1 && "ScheduleCalendar__tile--past"}`} key={i}
        onClick={() => onDateSelect(m.clone().date(i+1))}>
        <h2 className="ScheduleCalendar__day">{i+1}</h2>
        <p className="ScheduleCalendar__dow">
          {daysOfWeek[m.clone().date(i+1).isoWeekday() - 1]}
        </p>
      </div>
    )}
    {range(7 - m.clone().endOf("month").isoWeekday()).map(i =>
      <div key={i}
        className="ScheduleCalendar__tile ScheduleCalendar__tile--future"
        onClick={() => onDateSelect(m.clone().add(1, "month").date(i+1))}>
        <h2 className="ScheduleCalendar__day">{i+1}</h2>
        <p className="ScheduleCalendar__dow">
          {daysOfWeek[m.clone().add(1, "month").date(i+1).isoWeekday() - 1]}
        </p>
      </div>
    )
    }
  </div>
)

const ScheduleDetail = ({ movies }) => (
  <div className="ScheduleDetail">
    { movies.map((movie, i) => <Movie key={i} movie={movie} />) }
    {
      movies.length === 0 &&
        <div className="ScheduleMovie ScheduleMovie--empty">
          There are no movies on this day.
        </div>
    }
  </div>
)

const Schedule = ({ visible, setVisible }) => {
  const [schedule, setSchedule] = useState(null)
  const [selected, setSelected] = useState(null)
  const [day, setDay] = useState(moment())

  const onDateSelect = (day) => {
    const dayStart = day.clone().startOf("day")
    const dayEnd = day.clone().endOf("day")
    setSelected(
      _.sortBy(schedule.filter(movie =>
        moment(movie.startsAt).diff(dayStart) >= 0
        && moment(movie.endsAt).diff(dayEnd) <= 0,
      ), "startsAt"),
    )
    setDay(day)
  }

  const goBack = () => {
    if (selected) {
      setSelected(null)
      setDay(moment())
    } else
      setVisible(false)
  }

  // load the schedule
  useEffect(() => {
    if (schedule === null && visible === true)
      fetch("/.api/schedule")
        .then(r => r.json())
        .then(setSchedule)
        .catch(console.error)
  }, [visible])

  return (
    <div className={interp`Schedule ${visible && "Schedule--visible"}`}>
      <h1 className="Schedule__title">
        <div className="Schedule__back" onClick={goBack}>
          {selected
            ? <i className="fa fa-arrow-left fa-lg" />
            : <i className="fa fa-times fa-lg" />
          }
        </div>

        Schedule For
        {selected && ` ${day.format("D")}`}
        {" "}
        {day.format("MMMM YYYY")}
      </h1>
      {
        schedule === null
        ? <div className="Schedule__loading">Loading...</div>
        : (
          selected === null
          ? <ScheduleCalendar date={moment()} onDateSelect={onDateSelect} />
          : <ScheduleDetail movies={selected} />
        )
      }
    </div>
  )
}

export default Schedule
