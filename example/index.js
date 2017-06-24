import { h, app, Router } from '../src/index.js'

app({
  state: {
    counter: {
      count: 0,
    }
  },
  actions: {
    counter: {
      add: (s,a,d) => ({ counter: { count: s.counter.count + 1 } }),
      sub: (s,a,d) => ({ counter: { count: s.counter.count - 1 } }),
    }
  },
  events: {
    // loaded: console.log,
    // update: console.log,
    // action: console.log,
  },
  view: [
    ['/', (s,a,d) => h('main',{},[
      h('button', {
        onclick: a.counter.sub,
        oncreate: console.log,
        style: {
          background: 'red',
          border: 'none',
        }
      }, s.counter.count),
      h('button', {
        onclick: a.counter.add,
        oncreate: console.log,
        style: {
          background: 'red',
          border: 'none',
        }
      }, s.counter.count),
    ])],
    ['*', (s,a,d) => h('h1', {}, 'Are you Lost?')],
  ],
  mixins: [Router],
})
