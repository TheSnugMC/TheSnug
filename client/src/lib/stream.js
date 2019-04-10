
const getStreamData = () => fetch(
  "/.api/stream",
  { credentials: "same-origin", method: "GET" },
).then(r => r.json())

export default getStreamData
