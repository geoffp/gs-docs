/**
 * True if el is a real live <dd>
 * @param {any} el: Node
 * @returns {el is HTMLElement}
 */
const isDD = el => el instanceof HTMLElement && el.tagName === 'DD';


/**
 * Parse out one Instructions <dl> full of info
 * @param keyName {string}
 * @returns {object}
 */
function parseKey(keyName) {
  const data = {};
  document
    .querySelectorAll(`.${keyName}-key dt`)
    .forEach(/** @param dt {HTMLElement} */ dt => {
      const dd = dt.nextElementSibling;
      data[dt.innerText.trim()] = isDD(dd) ? dd.innerText.trim() : '<not found>';
    })
  return data;
}

/**
 *
 * @param {string[]} keyNames
 * @returns
 */
function parseKeys(keyNames) {
  const keys = {};
  keyNames.forEach(n => keys[n] = parseKey(n));
  return keys;
}

window.keys = parseKeys(['len', 'cycles', 'nvmxdizc_e']);

console.log('keys:', keys);
