type EventBindings = Record<string, (e: Event) => boolean | void>;

export class NanoCE extends HTMLElement {
  public dom: ProxyHandler<any>;


  protected set html(str: string) {
    this.build('template', str);
  }

  protected set css(str: string) {
    this.build('style', str);
  }

  protected set events(e: EventBindings) {
    this.bindEvents(e);
  }


  /** This is called for any type of event, on any NanoCE element. */
  private handleEvent(e: UIEvent) {
    const el = e.currentTarget;
    for (const [selector, func] of Object.entries(el instanceof NanoCE ? el.events[e.type] : {}))
      if (e.target instanceof Element && e.target.matches(selector)) func(e)
  }


  /** Element retrieval */
  private $(idOrSel: string): HTMLElement | null {
    return this.shadowRoot.getElementById(idOrSel) || this.shadowRoot.querySelector(idOrSel);
  }


  /**
   * Used to build out the <template> and <style> for the custom element
   */
  private build (name: 'template' | 'style', content: string) {
    const el = document.createElement(name);
    el.innerHTML = content;
    this.shadowRoot.appendChild(
      el instanceof HTMLTemplateElement ? el.content.cloneNode(true) : el
    );
  }


  /**
   * Add or remove all the declarative event listeners
   * Idea: writing declarative event bindings with CSS selectors is somewhat duplicative. Could / should they be declared in CSS??? Probably not (mixing of separate concerns), but maybe worth exploring. After all, they're both declarative...
   * It is alleged here (https://open-wc.org/guides/knowledge/events/) that the browser will garbage collect internal event listeners when the element is destroyed, so we don't need to call removeEventListener().
   */
  private bindEvents(events: EventBindings) {
    for (const eventType of Object.keys(events))
      this.shadowRoot.addEventListener(eventType, this.handleEvent);
  }


  constructor() {
    super();

    /**
     * Create the shadow DOM root
     * Note: I know this won't work if I ever need to use closed shadowRoot
     */
    this.attachShadow({ mode: 'open' });

    this.dom = new Proxy<any>({}, {
      get: (_, identifier: string): HTMLElement | null => this.$(identifier),
      set: (_, identifier: string, value:string) => {
        this.$(identifier).innerHTML = value;
        return true;
      }
    });
  }
}
