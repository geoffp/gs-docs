import { NanoCE } from '../nanoce.js';

class InstructionTableKey extends NanoCE {
  constructor() {
    super();

    this.html = `
<aside></aside>
`;

    this.css = `
* {
box-sizing: border-box;
}

aside {
display: block;
position: fixed;
z-index: 200;
top: var(--sticky-bar-height);
right: 0;
width: 20rem;
height: calc(100vh - var(--sticky-bar-height));
padding: var(--spacing-1);

color: rgba(0, 0, 0, 0.7);
background: var(--color-note);
pointer-events: none;
opacity: 0;
transition: all 300ms ease;
}

h4 {
margin-top: 0;
font-weight: bold;
}

aside.shown {
opacity: 1;
pointer-events: all;
}
`

    document.body.addEventListener('click', e => {
      const td = e.target instanceof Element && e.target.closest('td');
      if (td) {
        this.open(td);
      }
    });
  }


  open(td: HTMLTableCellElement) {
    const heading = findHeadingForTD(td);
    if (!heading) return;
    const content = this.grabDocs(heading);
    if (!content) return;

    const text = td.innerText;
    const terms = findTermsIn(text, '');
    this.dom.aside = '';
    this.setHeading(text);

    extendDocs(content);
    filterDocs(content, terms);

    this.dom.aside.appendChild(content);
    this.dom.aside.classList.add('shown');

    document.addEventListener(
      'scroll',
      _ => { console.log('scrolling'); this.close(); },
      { once: true }
    );
  }


  close() {
    this.dom.aside.classList.remove('shown');
  }


  /** Grab the <dl> with the info in it */
  grabDocs(headingName: string) {
    try {
      const className = headingName.toLowerCase().replace(' ', '_');
      const content = document.querySelector(`.${className}-key`);
      return content.cloneNode(true) as HTMLElement;
    } catch (e) {
      // dang
      console.error('e:', e);
      return null;
    }
  }

  setHeading(text: string) {
    const aside: HTMLElement = this.dom.aside;
    const h4 = document.createElement('h4');
    h4.innerText = text;
    aside.prepend(h4);
  }

  /** Given an element, position the popup under it */
  positionFor(el: Element) {
    const rect = el.getBoundingClientRect();
    [['bottom', 'top'], ['left', 'left']].forEach(([from, to]) => {
      this.dom.aside.style.setProperty(to, `${rect[from]}px`);
    })
  }
}

customElements.define('instruction-table-key', InstructionTableKey);


/** Add detail to docs */
function extendDocs(clone: HTMLElement) {
  const { nvmxdizc_e: flags } = (window as any).keys;

  for (const dt of Array.from(clone.getElementsByTagName('dt'))) {
    const term = dt.innerText;
    const flagDocs = flags[term];
    if (flagDocs) {
      const dd = dt.nextElementSibling as HTMLElement;
      dd.innerText += `: ${flagDocs}`;
    }
  }
}

/** Find the heading for whichever td was clicked on.  */
function findHeadingForTD(td: HTMLTableCellElement) {
  try {
    return td.closest('table')
             .querySelector<HTMLTableRowElement>('thead > tr')
             .cells[td.cellIndex]
             .innerText;
  } catch (err) {
    return null;
  }
}

function findTermsIn(s, scopes) {
  const keys = (window as any).keys;
  const allTermNames = new Set();
  Object.values(keys).forEach(terms => {
    Object.keys(terms).forEach(termName => {
      allTermNames.add(termName)
    });
  });
  const reText = `\\b(${Array.from(allTermNames).join('|').replace('*', '\\*')})\\b`;
  const re = new RegExp(reText, 'g');
  const matches = Array.from(s.matchAll(re)).map(m => m[0]);
  console.log('matches:', matches);
  return new Set(matches);
}

/** Filter the cloned dt by a set of terms */
function filterDocs(dl: HTMLElement, terms: Set<string>) {
  const dts = dl.getElementsByTagName('dt');

  Array.from(dts).forEach(dt => {
    const termName = dt.innerText.toLowerCase().trim();
    if (!terms.has(termName)) {
      const dd = dt.nextElementSibling;
      dt.remove();
      dd.remove();
    }
  });
}



function flagLookup(dl, text) {
  console.log('looking up flags for:', text);
}
