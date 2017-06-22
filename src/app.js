const array = x => x||[]
const extend = (a, b) => {
  var obj = {}
  if (typeof b !== "object" || Array.isArray(b)) return b
  for (var i in a) obj[i] = a[i]
  for (var i in b) obj[i] = b[i]
  return obj
}

export default (app) => {
  const actions = {}
  const events = {}
  let state = {}
  let node
  let element

  for (var i = -1, mixins = []; i < mixins.length; i++) {
    const mixin = mixins[i] ? mixins[i](app) : app
    mixins = mixins.concat(array(mixin.mixins))
    if (mixin.state != null) state = extend(state, mixin.state)
    register(actions, mixin.actions)
    Object.keys(array(mixin.events)).map(key =>
      events[key] = array(events[key]).concat(mixin.events[key])
    )
  }

  document.readyState[0] !== "l"
    ? load()
    : addEventListener("DOMContentLoaded", load)

  function register(namespace, children, lastName) {
    const update = (action, name) => data => {
      const result = action(
        state,
        actions,
        emit("action", { name, data }).data,
        emit
      )
      if (result == null || typeof result.then === "function") return result
      render((state = extend(state, emit("update", result))), app.view)
    }
    Object.keys(array(children)).map(key => {
      const action = children[key]
      const name = lastName ? lastName + "." + key : key
      typeof action === "function"
        ? namespace[key] = update(action, name)
        : register(namespace[key] || (namespace[key] = {}), action, name)
    })
  }

  function load() {
    render(state)
    emit("loaded")
  }

  function emit(name, data) {
    array(events[name]).map(cb => {
      const result = cb(state, actions, data, emit)
      if (result != null) data = result
    })
    return data
  }

  function render(state) {
    element = patch(
      app.root || (app.root = document.body),
      element,
      node,
      (node = emit("render", app.view)(state, actions))
    )
  }

  function createElementFrom(node, isSVG) {
    let element
    if (typeof node === "string") element = document.createTextNode(node)
    else {
      element = (isSVG = isSVG || node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag)
      for (let i = 0; i < node.children.length; )
        element.appendChild(createElementFrom(node.children[i++], isSVG))
      for (let i in node.data) i === "oncreate"
        ? node.data[i](element)
        : setElementData(element, i, node.data[i])
    }
    return element
  }

  function setElementData(element, name, value, oldValue) {
    if (name === "key") return
    if (name === "style")
      for (let i in extend(oldValue, (value = value || {})))
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
    for (var name in extend(oldData, data)) {
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
    const removeChild = () => parent.removeChild(element)
    ;((node.data && node.data.onremove) || removeChild)(element, removeChild)
  }

  function patch(parent, element, oldNode, node) {
    if (oldNode == null)
      element = parent.insertBefore(createElementFrom(node), element)
    else if (node.tag && node.tag === oldNode.tag) {
      const len = node.children.length
      const oldLen = oldNode.children.length
      const reusableChildren = {}
      const oldElements = []
      const newKeys = {}

      updateElementData(element, oldNode.data, node.data)
      for (var i = 0; i < oldLen; i++) {
        const [oldElement, oldChild] = [element.childNodes[i], oldNode.children[i]]
        const oldKey = getKeyFrom(oldChild)
        if (oldKey != null) reusableChildren[oldKey] = [oldElement, oldChild]
        oldElements[i] = oldElement
      }

      var i = 0
      var j = 0

      while (j < len) {
        const oldElement = oldElements[i]
        const oldChild = oldNode.children[i]
        const newChild = node.children[j]
        const oldKey = getKeyFrom(oldChild)

        if (newKeys[oldKey]) {
          i++
          continue
        }

        const newKey = getKeyFrom(newChild)
        const reusableChild = array(reusableChildren[newKey])

        if (newKey == null) {
          if (oldKey == null) {
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
        if (getKeyFrom(oldNode.children[i]) == null)
          removeElement(element, oldElements[i], oldNode.children[i])
        i++
      }
      Object.keys(reusableChildren)
      .map(key => !newKeys[reusableChildren[key][1].data.key]
        ? removeElement(element, reusableChildren[key][0], reusableChildren[key][1])
        : null
      )
    } else if (node !== oldNode) {
      const i = element
      parent.replaceChild((element = createElementFrom(node)), i)
    }
    return element
  }
}
