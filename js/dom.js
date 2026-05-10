// Tiny DOM helpers.

const svgParser = new DOMParser();

// Parse a trusted SVG string from our own data files into an Element.
// Inputs are static strings authored in this codebase (classes.js,
// resources.js) — never user input — so this is safe.
export const svgEl = (svgString) => {
  const doc = svgParser.parseFromString(svgString, 'image/svg+xml');
  return document.importNode(doc.documentElement, true);
};

export const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'text') {
      node.textContent = v;
    } else if (v !== undefined && v !== null && v !== false) {
      node.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
};
