import { h, app, Router } from 'hyperapp'
import marked from 'marked'
import highlight from 'highlight.js'

import Linker from './plugins/linker'

marked.setOptions({
  highlight: (code) => highlight.highlightAuto(code).value
})

const handleErrors = response => {
  if (!response.ok) throw Error(response.statusText)
  return response
}

const Article = ({html, a}) => {

  html ? null :
    fetch('/markdown/README.md')
    .then(data => data.text())
    .then(marked)
    .then(a.setArticle)
    .catch(a.setArticle)

  return <article class='markdown-body' onUpdate={ e => e.innerHTML = html }></article>

}

const Aside = ({html, a}) => {

  html ? null :
    fetch('/markdown/CONTENTS.md')
    .then(data => data.text())
    .then(marked)
    .then(a.setAside)
    .catch(a.setAside)

  return <aside class='markdown-body' onUpdate={ e => e.innerHTML = html }></aside>

}

app({
  state: {
    aside: '',
    article: '',
  },
  actions: {
    setArticle: (s,d) => ({ article: d }),
    setAside: (s,d) => ({ aside: d }),
  },
  events: {
    // update: (s) => console.log(s),
    route: (s,a,d) => {
      fetch(`/markdown${location.pathname}.md`)
      .then(data => data.text())
      .then(marked)
      .then(a.setArticle)
      .catch(a.setArticle)
    },
  },
  view: (s,a,d) =>
    <page->
      <header>
        <icon-></icon->
        <h1>Hyperapp Docs</h1>
      </header>
      <main>
        <Aside html={s.aside} a={a} />
        <Article html={s.article} a={a} />
      </main>
    </page->,
  plugins: [Router, Linker],
})
