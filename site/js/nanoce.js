/**
 * This is called for any type of event, on any element.
 * @param e { MouseEvent } - the event
 */
function handleEvent(e) {
  for (const [selector, func] of Object.entries(e.currentTarget.events[e.type]))
    if (e.target.matches(selector)) func(e)
}

/**
 * Main setup function for a custom element - this is called in its constructor
 * @param e { HTMLElement } - the custom element we're setting up
 */
export function setup(customEl) {

  /**
   * Create the shadow DOM root
   * Note: I know this won't work if I ever need to use closed shadowRoot
   */
  customEl.attachShadow({ mode: 'open' });
  const { shadowRoot: root } = customEl;

  /**
   * Used to build out the <template> and <style> for the custom element
   */
  function build (name, content) {
    const el = document.createElement(name);
    el.innerHTML = content;
    root.appendChild(name === 'template' ? el.content.cloneNode(true) : el);
  }

  /**
   * Used to build out the <template> and <style> for an externally defined custom element
   */
  function build (name, content) {
    const el = document.createElement(name);
    el.innerHTML = content;
    root.appendChild(name === 'template' ? el.content.cloneNode(true) : el);
  }

  /**
   * Add or remove all the declarative event listeners
   * Idea: writing declarative event bindings with CSS selectors is somewhat duplicative. Could / should they be declared in CSS??? Probably not (mixing of separate concerns), but maybe worth exploring. After all, they're both declarative...
   * It is alleged here (https://open-wc.org/guides/knowledge/events/) that the browser will garbage collect internal event listeners when the element is destroyed, so we don't need to call removeEventListener().
   * @param events - the declarative events object
   */
  function bindEvents(events) {
    root.events = events;
    for (const eventType of Object.keys(events))
      root.addEventListener(eventType, handleEvent);
  }

  const $ = root.getElementById.bind(root);
  customEl.dom = new Proxy(customEl, {
    get: (_, prop) => $(prop),
    set: (_, prop, value) => $(prop).innerHTML = value
  })

  return {
    events: bindings => bindEvents(bindings),
    css: code => build('style', code),
    html: code => build('template', code),
    htmlext: code => build('template', code)
  }
}
