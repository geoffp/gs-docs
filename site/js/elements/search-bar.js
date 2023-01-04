import { NanoCE } from '../nanoce.ts';

class SearchBar extends NanoCE {
  /** Bind events using CSS selectors as an element-finding DSL */
  events = {
    input: {
      /** @param e {InputEvent} */
      'input': e => {
        const value = getInputValue(e);
        const needle = value.trim().toLowerCase();

        if (needle.length > 2) {
          /* We search the table of contents for links to headings! If found, we
             scroll that into view, keeping focus on the search. */
          const nav = document.querySelector('nav');
          const textNodes = textNodesUnder(nav);

          for (const textNode of textNodes) {
            const haystack = textNode.data.toLowerCase();
            if (haystack.includes(needle)) {
              scrollToSectionForMatch(textNode);
            }
          }
        }
      }
    },
    focusin: {
      /** @param e {FocusEvent} */
      'input': e => {
        const input = /** @type HTMLInputElement */ (e.target);
        input.select();
      }
    }
  };

  /** Build the HTML  */
  html = `
    <div>
      <a href="#">top</a>
      <input type="search" id="search" name="search">
    </div>
  `;

  css = `
:host {
display: flex;
align-items: center;
justify-content: flex-end;
}

* {
box-sizing: border-box;
}

div {
display: flex;
align-items: center;
justify-content: flex-end;
width: var(--sticky-nav-width);
height: 100%;
padding: 2px 0;
}

a {
flex: 1 1 auto;
color: var(--color-link);
font-size: 1.4rem;
}

a:hover,
a:active {
color: var(--color-link-hover);
text-decoration: underline;
}

input {
flex: 1 1 auto;
width: 50%;
height: 100%;
position: relative;
border: none;
background: white;
margin: 0 2px 0 0;
padding: 0.5em;
z-index: 100;

font: var(--mono-font);
color: var(--color-link);
box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.1);
}

input:focus {
outline-offset: -1px;
outline-style: dashed;
}
  `;

  constructor() {
    super();
  }
}

customElements.define('search-bar', SearchBar);

/**
 * Return all text nodes which are descendants of the given element
 * @param el {Element}
 */
function textNodesUnder(el) {
  let n = null;
  const a = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  while(n = walk.nextNode()) a.push(n);
  return /** @type {Text[]} */ (a);
}



/**
 * For a given text node, find an <a> ancestor whose href is a #hash link
 * to an element id
 * @param textNode {Text}
 * @returns {HTMLElement | null}
 */
function findIdLinkForMatch(textNode) {
  // Grab the node's closest <a>
  const a = textNode.parentElement.closest('a');

  // If we find one with a #hash:
  // - get its #hash portion
  // - hack off the #
  // - find the element matching that ID
  if (a && a.hash) return document.getElementById(a.hash.slice(1));
  return null;
}

/**
 * Find the nearest section or nav around the identified element
 * and scroll to it.
 * @param textNode {Text}
 * @returns {HTMLElement | null}
 */
function findSectionForMatch(textNode) {
  const el = findIdLinkForMatch(textNode)
  if (el) return el.closest('section,nav');
  return null
}

/**
 * Given a text node matching a search term, find the content it describes
 * and scroll to it
 * @param textNode {Text}
 */
function scrollToSectionForMatch(textNode) {
  const section = findSectionForMatch(textNode);
  if (section) section.scrollIntoView(true);
  else console.warn(`No content found for text node ${textNode.data}`);
}

/**
 * If the given event's target is an <input>, return its string value, otherwise ""
 * @param e {Event}
 */
function getInputValue(e) {
  return e.target instanceof HTMLInputElement ? e.target.value : "";
}
