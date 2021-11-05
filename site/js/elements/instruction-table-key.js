import { setup } from '../nanoce.js';

class InstructionTableKey extends HTMLElement {
  constructor() {
    super();
    const { css, html, events } = setup(this);

    /** Build the HTML  */
    html`
      <aside></aside>
    `;

    document.body.addEventListener('click', e => {
      console.log(e);
      if (e.target instanceof HTMLTableCellElement) {
        const showing = this.shadowRoot.children[0].classList.toggle('shown');
        if (showing) {
          const heading = findHeadingForClick(e);
          this.grabDocs(heading);
        }
      }
    });

    /** Bind events using CSS selectors as an element-finding DSL */
    /* events(); */

    css`
      * {
      box-sizing: border-box;
      }

      aside {
      position: fixed;
      top: 0;
      left: 0;
      width: 20rem;
      height: 20rem;
      color: rgba(0, 0, 0, 0.7);
      background: #BCFDA0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 200;
      opacity: 0;
      transition: all 300ms ease;
      }

      aside.shown {
      opacity: 1;
      }
    `;
  }

  /**
   * Grab the <dl> with the info in it
   * @param {string} headingName
   */
  grabDocs(headingName) {
    try {
      console.log('getting', headingName);
      const content = document.querySelector(`.${headingName.toLowerCase()}-key`);
      const clone = content.cloneNode(true);
      console.log('clone:', clone);
      extendDocs(clone);
      this.dom.aside = "";
      this.dom.aside.appendChild(clone);
    } catch (e) {
      // dang
      console.log('e:', e);
    }
  }
}

customElements.define('instruction-table-key', InstructionTableKey);

/**
 * Add detail to docs
 * @param {HTMLElement} clone
 */
function extendDocs(clone) {
  const { flags } = window.keys;

  for (const dt of clone.getElementsByTagName('dt')) {
    const term = dt.innerText;
    const flagDocs = flags[term];
    if (flagDocs) {
      const dd = dt.nextElementSibling;
      dd.innerText += `: ${flagDocs}`;
    }
  }
}

/**
 * Find the heading for whichever td was clicked on.
 * @param {PointerEvent} e
 */
function findHeadingForClick(e) {
  try {
    const td = e.target.closest('td');
    return td.closest('table')
             .querySelector('thead > tr')
             .cells[td.cellIndex]
             .innerText;
  } catch (err) {
    return null;
  }
}
