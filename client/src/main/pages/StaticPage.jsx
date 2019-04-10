import React, { useState, useEffect } from "react"

import marked from "marked"

import NotFound from "main/pages/NotFound"

import "./StaticPage.scss"

export default ({ match }) => {
  const [pageContent, setPageContent] = useState(null)
  const [pageFound, setPageFound] = useState(null)

  // load the page
  useEffect(() => {
    setPageContent(null)
    setPageFound(null)

    fetch(`/.api/pages/${match.params.pageId}`)
      .then(res => {
        if (res.ok) {
          return res.text()
        } else {
          throw res
        }
      }).then(data => {
        setPageFound(true)
        setPageContent({ __html: marked(data) })
      }, res => {
        if (res.status === 404) {
          setPageFound(false)
          setPageContent(false)
        } else {
          setPageFound(true)
          setPageContent({ __html: "<h1>There was an error loading the page.</h1>" })
        }
      }).catch(err => {
        console.error(err)
        setPageFound(true)
        setPageContent({ __html: "<h1>There was an error loading the page.</h1>" })
      })
  }, [match.params.pageId])

  return (
    <div className="StaticPage">
    {
      pageContent !== null && pageContent !== false &&
        <div className="StaticPage__content" dangerouslySetInnerHTML={pageContent} />
    }
    {
      pageContent === null && <h1>Loading...</h1>
    }
    {
      pageFound === false && <NotFound />
    }
    </div>
  )
}
