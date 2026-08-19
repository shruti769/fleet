// Minimal tolerant HTML parser for the Claude Design prototype export.
// The markup is machine generated and well balanced, so a small tokenizer is
// enough — no dependency needed.

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'base', 'col']);

export function parse(html) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  let i = 0;

  const push = (node) => stack[stack.length - 1].children.push(node);

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      addText(html.slice(i));
      break;
    }
    if (lt > i) addText(html.slice(i, lt));

    if (html.startsWith('<!--', lt)) {
      i = html.indexOf('-->', lt) + 3;
      continue;
    }
    if (html.startsWith('<!', lt)) {
      i = html.indexOf('>', lt) + 1;
      continue;
    }

    const gt = findTagEnd(html, lt);
    const raw = html.slice(lt + 1, gt);

    if (raw[0] === '/') {
      const name = raw.slice(1).trim().toLowerCase();
      for (let d = stack.length - 1; d > 0; d--) {
        if (stack[d].name === name) {
          stack.length = d;
          break;
        }
      }
      i = gt + 1;
      continue;
    }

    const selfClosing = raw.endsWith('/');
    const body = selfClosing ? raw.slice(0, -1) : raw;
    const { name, attrs } = parseTag(body);
    const node = { type: 'element', name, attrs, children: [] };
    push(node);
    if (!selfClosing && !VOID.has(name)) stack.push(node);
    i = gt + 1;
  }

  return root;

  function addText(text) {
    if (!text) return;
    const parent = stack[stack.length - 1];
    parent.children.push({ type: 'text', value: text });
  }
}

// A tag may contain '>' inside a quoted attribute value (SVG paths do not, but
// handler bindings such as onclick="{{ a > b }}" would).
function findTagEnd(html, lt) {
  let quote = null;
  for (let j = lt + 1; j < html.length; j++) {
    const c = html[j];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j;
    }
  }
  return html.length;
}

function parseTag(body) {
  const m = /^([a-zA-Z][\w:-]*)/.exec(body);
  const name = m[1].toLowerCase();
  const attrs = {};
  const re = /([\w:.-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  re.lastIndex = m[0].length;
  let a;
  while ((a = re.exec(body))) {
    const key = a[1];
    const value = a[3] ?? a[4] ?? a[5] ?? '';
    attrs[key] = decode(value);
  }
  return { name, attrs };
}

export function decode(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&times;/g, '×')
    .replace(/&amp;/g, '&');
}

export function walk(node, fn) {
  fn(node);
  for (const child of node.children || []) walk(child, fn);
}

export function findAll(node, predicate, out = []) {
  walk(node, (n) => {
    if (n.type === 'element' && predicate(n)) out.push(n);
  });
  return out;
}
