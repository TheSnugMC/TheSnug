import { useState } from "react"

export const interp = (xs, ...parts) => {
  if (xs.length === 0) return ""
  else if (xs.length === 1) return xs.shift()
  else return `${xs[0]}${parts[0] != null && parts[0] !== false ? parts[0] : ""}${
    interp(xs.slice(1), parts.slice(1))}`
}

export const range = (_start, _end = null, step = 1) => {
  const start = _end === null ? 0 : _start
  const end = _end === null ? _start : _end
  return [...Array(end - start).keys()].filter((_, i) => i % step === 0)
}

export const useToggle = () => {
  const [toggle, setToggle] = useState()

  return [toggle, () => setToggle(oldToggle => !oldToggle)]
}

export const apiFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  })
