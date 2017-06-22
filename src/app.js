export default (app) => {
  var state = {}
  var view = app.view
  var actions = {}
  var events = {}
  var node
  var element

  for (var i = -1, mixins = []; i < mixins.length; i++) {
    var mixin = mixins[i] ? mixins[i](app) : app
    mixins = mixins.concat(mixin.mixins || [])

    if (mixin.state != null) state = merge(state, mixin.state)

    init(actions, mixin.actions)

    Object.keys(mixin.events || []).map(key =>
      events[key] = (events[key] || []).concat(mixin.events[key])
    )
  }

  document.readyState[0] !== "l"
    ? load()
    : addEventListener("DOMContentLoaded", load)

  function init(namespace, children, lastName) {
    var update = (action, name) => data => {
      var result = action(
        state,
        actions,
        emit("action", { name, data }).data,
        emit
      )
      if (result == null || typeof result.then === "function") return result
      render((state = merge(state, emit("update", result))), view)
    }

    Object.keys(children || []).map(key => {
      var action = children[key]
      var name = lastName ? lastName + "." + key : key

      typeof action === "function"
        ? namespace[key] = update(action, name)
        : init(namespace[key] || (namespace[key] = {}), action, name)
    })
  }

  function load() {
    render(state, view)
    emit("loaded")
  }

  function emit(name, data) {
    ;(events[name] || []).map(cb => {
      var result = cb(state, actions, data, emit)
      if (result != null) data = result
    })

    return data
  }

  function render(state, view) {
    element = patch(
      app.root || (app.root = document.body),
      element,
      node,
      (node = emit("render", view)(state, actions))
    )
  }

  function merge(a, b) {
    var obj = {}

    if (typeof b !== "object" || Array.isArray(b)) return b

    for (var i in a) obj[i] = a[i]
    for (var i in b) obj[i] = b[i]

    return obj
  }

  function createElementFrom(node, isSVG) {
    if (typeof node === "string") var element = document.createTextNode(node)
    else {
      var element = (isSVG = isSVG || node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag)

      for (var i = 0; i < node.children.length; )
        element.appendChild(createElementFrom(node.children[i++], isSVG))

      for (var i in node.data) i === "oncreate"
        ? node.data[i](element)
        : setElementData(element, i, node.data[i])
    }

    return element
  }

  function setElementData(element, name, value, oldValue) {
    if (name === "key") return
    if (name === "style")
      for (var i in merge(oldValue, (value = value || {})))
        element.style[i] = value[i] || ""
    else {
      try { element[name] = value }
      catch (_) {}

      if(typeof value !== "function") value
        ? element.setAttribute(name, value)
        : element.removeAttribute(name)
    }
  }

  function updateElementData(element, oldData, data) {
    for (var name in merge(oldData, data)) {
      var value = data[name]
      var oldValue = name === "value" || name === "checked"
        ? element[name]
        : oldData[name]

      if (name === "onupdate" && value) value(element)
      else if (value !== oldValue) setElementData(element, name, value, oldValue)
    }
  }

  function getKeyFrom(node) {
    if (node && (node = node.data)) return node.key
  }

  function removeElement(parent, element, node) {
    ;((node.data && node.data.onremove) || removeChild)(element, removeChild)
    function removeChild() {
      parent.removeChild(element)
    }
  }

  function patch(parent, element, oldNode, node) {
    if (oldNode == null) element = parent.insertBefore(createElementFrom(node), element)
    else if (node.tag && node.tag === oldNode.tag) {
      updateElementData(element, oldNode.data, node.data)

      var len = node.children.length
      var oldLen = oldNode.children.length
      var reusableChildren = {}
      var oldElements = []
      var newKeys = {}

      for (var i = 0; i < oldLen; i++) {
        var [oldElement, oldChild] = [element.childNodes[i], oldNode.children[i]]
        var oldKey = getKeyFrom(oldChild)
        if (oldKey != null) reusableChildren[oldKey] = [oldElement, oldChild]
        oldElements[i] = oldElement
      }

      var i = 0
      var j = 0

      while (j < len) {
        var oldElement = oldElements[i]
        var oldChild = oldNode.children[i]
        var newChild = node.children[j]

        var oldKey = getKeyFrom(oldChild)
        if (newKeys[oldKey]) {
          i++
          continue
        }

        var newKey = getKeyFrom(newChild)

        var reusableChild = reusableChildren[newKey] || []

        if (null == newKey) {
          if (null == oldKey) {
            patch(element, oldElement, oldChild, newChild)
            j++
          }
          i++
        } else {
          if (oldKey === newKey) {
            patch(element, reusableChild[0], reusableChild[1], newChild)
            i++
          } else if (reusableChild[0]) {
            element.insertBefore(reusableChild[0], oldElement)
            patch(element, reusableChild[0], reusableChild[1], newChild)
          } else patch(element, oldElement, null, newChild)
          j++
          newKeys[newKey] = newChild
        }
      }

      while (i < oldLen) {
        var oldChild = oldNode.children[i]
        var oldKey = getKeyFrom(oldChild)
        if (oldKey == null) removeElement(element, oldElements[i], oldChild)
        i++
      }

      for (var i in reusableChildren) {
        var reusableChild = reusableChildren[i]
        var reusableNode = reusableChild[1]
        if (!newKeys[reusableNode.data.key]) {
          removeElement(element, reusableChild[0], reusableNode)
        }
      }
    } else if (node !== oldNode) {
      var i = element
      parent.replaceChild((element = createElementFrom(node)), i)
    }

    return element
  }
}
