import { setup } from '/js/nanoce.js';

function textNodesUnder(el) {
  let n = null;
  const a = [];
  const walk = document.createTreeWalker(
    el, NodeFilter.SHOW_TEXT, null, false
  );
  while(n = walk.nextNode()) a.push(n);
  return a;
}

class SearchBar extends HTMLElement {
  constructor() {
    super();
    const { css, html, events } = setup(this);

    /** Build the HTML  */
    html`
      <div>
        <a href="#">top</a>
        <input type="search" id="search" name="search">
      </div>
    `;

    /** Bind events using CSS selectors as an element-finding DSL */
    events({
      input: {
        'input': e => {
          /** @type string */
          const { value } = e.target;
          const needle = value.trim().toLowerCase();

          if (needle.length > 2) {
            const nav = document.querySelector('nav');
            const textNodes = textNodesUnder(nav);
            console.log('long enough');

            for (const textNode of textNodes) {
              const haystack = textNode.data.toLowerCase();
              if (haystack.includes(needle)) {
                console.log('found!');
                const a = textNode.parentElement.closest('a');
                console.log('a:', a);
                window.location.hash = a.hash;
              }
            }
          }
        }
      },
      focusin: {
        /** @param e {FocusEvent} */
        'input': e => {
          console.log('focus');

          /** @type HTMLInputElement */
          const input = e.target;
          input.select();
        }
      }
    });

    css`
      :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      }

      div {
      display: flex;
      align-items: stretch;
      justify-content: flex-end;
      width: var(--sticky-nav-width);
      }

      a {
      flex: 1 1 auto;
      border: 1px solid rgba(0, 0, 0, 0.2);
      color: var(--color-link);
      border-radius: 4px;
      padding: 0.2em 0.4em;
      font-size: 1rem;
      text-decoration: none;
      }

      a:hover,
      a:active {
      color: var(--color-link-hover);
      text-decoration: underline;
      }

      input {
      flex: 1 1 auto;
      width: 50%;
      position: relative;
      border: 1px solid #999;
      background: white;
      margin: 0 var(--spacing-1);
      z-index: 100;
      }
    `;
  }
}

customElements.define('search-bar', SearchBar);
