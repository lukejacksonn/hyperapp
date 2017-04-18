# Getting Started

The easiest way to get started with HyperApp is to grab the minified library from a CDN.

```html
<script src="https://unpkg.com/hyperapp"></script>
```

You can use a specific version too.

```html
<script src="https://unpkg.com/hyperapp@0.8.1"></script>
```

Or try it on [CodePen](http://codepen.io/jbucaran/pen/Qdwpxy?editors=0010).

## Hello World

Create an `index.html` file, paste the code below and open it in your browser.

<a name="cb1"></a> [View Online](http://codepen.io/jbucaran/pen/VPqoYR)</sub>

```html
<body>
  <script src="https://unpkg.com/hyperapp"></script>
  <script>

  const { h, app } = hyperapp

  app({
    state: "Hi.",
    view: state => h("h1", null, state)
  })

  </script>
</body>
```

## JSX

You can use [JSX](https://facebook.github.io/jsx/) too.

<a name="cb2"></a> [View Online](http://codepen.io/jbucaran/pen/Qdwpxy)</sub>

```html
<body>
  <script src="https://unpkg.com/hyperapp"></script>
  <script src="https://unpkg.com/babel-standalone"></script>
  <script type="text/babel">

  const { h, app } = hyperapp
  /** @jsx h */

  app({
    state: "Hi.",
    view: state => <h1>{state}</h1>
  })

  </script>
</body>
```

## Hyperx

If you prefer an ES6 native solution, you can use [Hyperx](https://github.com/substack/hyperx) instead.

<a name="cb3"></a> [View Online](http://codepen.io/jbucaran/pen/KWZqay?editors=0010)</sub>

```html
<body>
  <script src="https://unpkg.com/hyperapp"></script>
  <script src="https://wzrd.in/standalone/hyperx"></script>
  <script>

  const { h, app } = hyperapp
  const html = hyperx(h)

  app({
    state: "Hi.",
    view: state => html`<h1>${state}</h1>`
  })

  </script>
</body>
```

## Next

The workflow presented here is great for demos and sharing examples, but not ideal for production applications.

In the next section, we'll explore how to create a [[Build Pipeline]] using Browserify, Webpack and Rollup.
