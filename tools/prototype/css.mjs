// CSS (inline, as authored in the prototype) -> React Native style objects.
//
// Every literal number is carried through unchanged. The only values that do
// not survive verbatim are the ones marked INSET_TOP / INSET_BOTTOM, which the
// generator turns into real safe-area insets (see plan decision 1).

export const INSET_TOP = '__INSET_TOP__';
export const INSET_BOTTOM = '__INSET_BOTTOM__';

const FONT_FAMILY = {
  Inter: {
    400: 'Inter_400Regular',
    500: 'Inter_500Medium',
    600: 'Inter_600SemiBold',
    700: 'Inter_700Bold',
  },
  'Barlow Semi Condensed': {
    400: 'BarlowSemiCondensed_400Regular',
    500: 'BarlowSemiCondensed_500Medium',
    600: 'BarlowSemiCondensed_600SemiBold',
    700: 'BarlowSemiCondensed_700Bold',
  },
  'Roboto Mono': {
    400: 'RobotoMono_400Regular',
    500: 'RobotoMono_500Medium',
    600: 'RobotoMono_600SemiBold',
    700: 'RobotoMono_700Bold',
  },
};

// Properties that belong on <Text> rather than <View>, and that CSS inherits.
export const TEXT_PROPS = new Set([
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'color',
  'letterSpacing',
  'textTransform',
  'textAlign',
  'textDecorationLine',
]);

// Properties that describe how a scroll container lays its children out; these
// move to contentContainerStyle when the element becomes a ScrollView.
export const CONTENT_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'gap',
  'rowGap',
  'columnGap',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'flexWrap',
]);

export function splitDeclarations(style) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of style || '') {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      if (current.trim()) out.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out.map((d) => {
    const idx = d.indexOf(':');
    return [d.slice(0, idx).trim().toLowerCase(), d.slice(idx + 1).trim()];
  });
}

const round = (n) => Math.round(n * 1000) / 1000;

const camelCase = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const px = (value) => {
  const t = String(value).trim();
  if (t.endsWith('%')) return t;
  const n = parseFloat(t);
  return Number.isNaN(n) ? t : n;
};

/**
 * @returns {{ style: object, animation: object|null, scroll: boolean, notes: string[] }}
 */
export function convert(style) {
  const out = {};
  const notes = [];
  let animation = null;
  let scroll = false;
  let isFlex = false;
  let hasDirection = false;

  for (const [prop, rawValue] of splitDeclarations(style)) {
    const value = rawValue.trim();

    // A handful of declarations are data bound (`width:{{ qPct }}`); those
    // become runtime style values rather than StyleSheet entries.
    const bound = /^\{\{\s*(.+?)\s*\}\}$/.exec(value);
    if (bound) {
      out[`__dyn_${camelCase(prop)}`] = bound[1];
      continue;
    }

    switch (prop) {
      case 'display':
        if (value === 'grid') out.__grid = true;
        else if (value === 'none') out.display = 'none';
        else if (value === 'flex' || value === 'inline-flex') isFlex = true;
        // block / inline-block stack vertically, which is the RN default
        break;

      case 'grid-template-columns': {
        const repeat = /repeat\((\d+),\s*1fr\)/.exec(value);
        if (repeat) {
          out.__gridColumns = Number(repeat[1]);
        } else if (/^(1fr\s*)+$/.test(value.trim())) {
          out.__gridColumns = value.trim().split(/\s+/).length;
        } else {
          notes.push(`unsupported grid-template-columns: ${value}`);
        }
        break;
      }

      case 'flex-direction':
        out.flexDirection = value;
        hasDirection = true;
        break;
      case 'align-items':
        out.alignItems = cssAlign(value);
        break;
      case 'align-self':
        out.alignSelf = cssAlign(value);
        break;
      case 'justify-content':
        out.justifyContent = cssJustify(value);
        break;
      case 'flex-wrap':
        out.flexWrap = value;
        break;
      case 'gap':
        out.gap = px(value);
        break;
      case 'row-gap':
        out.rowGap = px(value);
        break;
      case 'column-gap':
        out.columnGap = px(value);
        break;

      case 'flex': {
        if (value === 'none') {
          out.flexGrow = 0;
          out.flexShrink = 0;
        } else if (/^\d+$/.test(value)) {
          out.flex = Number(value);
        } else {
          const parts = value.split(/\s+/);
          out.flexGrow = Number(parts[0]);
          if (parts[1] !== undefined) out.flexShrink = Number(parts[1]);
          if (parts[2] !== undefined) out.flexBasis = px(parts[2]);
        }
        break;
      }
      case 'flex-shrink':
        out.flexShrink = Number(value);
        break;
      case 'flex-grow':
        out.flexGrow = Number(value);
        break;
      case 'flex-basis':
        out.flexBasis = px(value);
        break;

      case 'width':
        out.width = px(value);
        break;
      case 'height':
        out.height = px(value);
        break;
      case 'min-width':
        // `min-width:0` is a CSS flexbox workaround with no RN equivalent.
        if (px(value) !== 0) out.minWidth = px(value);
        break;
      case 'min-height':
        out.minHeight = px(value);
        break;
      case 'max-width':
        out.maxWidth = px(value);
        break;
      case 'max-height':
        out.maxHeight = px(value);
        break;

      case 'position':
        out.position = value === 'fixed' ? 'absolute' : value;
        break;
      case 'inset':
        if (value === '0') {
          out.top = 0;
          out.right = 0;
          out.bottom = 0;
          out.left = 0;
        } else {
          const parts = value.split(/\s+/).map(px);
          const [t, r = t, b = t, l = r] = parts;
          Object.assign(out, { top: t, right: r, bottom: b, left: l });
        }
        break;
      case 'top':
        out.top = px(value) === 54 ? INSET_TOP : px(value);
        break;
      case 'right':
        out.right = px(value);
        break;
      case 'bottom':
        out.bottom = px(value);
        break;
      case 'left':
        out.left = px(value);
        break;
      case 'z-index':
        out.zIndex = Number(value);
        break;

      case 'padding':
      case 'margin': {
        const key = prop === 'padding' ? 'padding' : 'margin';
        const parts = value.split(/\s+/);
        const vals = parts.map((p) => (p === 'auto' ? 'auto' : px(p)));
        const [t, r = t, b = t, l = r] = vals;
        // A 54px top padding is the prototype's status bar allowance.
        out[`${key}Top`] = t === 54 && key === 'padding' ? INSET_TOP : t;
        out[`${key}Right`] = r;
        out[`${key}Bottom`] = b;
        out[`${key}Left`] = l;
        break;
      }
      case 'padding-top':
        out.paddingTop = px(value) === 54 ? INSET_TOP : px(value);
        break;
      case 'padding-right':
        out.paddingRight = px(value);
        break;
      case 'padding-bottom':
        out.paddingBottom = px(value);
        break;
      case 'padding-left':
        out.paddingLeft = px(value);
        break;
      case 'margin-top':
        out.marginTop = px(value);
        break;
      case 'margin-right':
        out.marginRight = px(value);
        break;
      case 'margin-bottom':
        out.marginBottom = px(value);
        break;
      case 'margin-left':
        out.marginLeft = px(value);
        break;

      case 'background':
      case 'background-color':
        out.backgroundColor = value;
        break;

      case 'border': {
        const b = parseBorder(value);
        if (b) {
          out.borderWidth = b.width;
          out.borderColor = b.color;
          if (b.style !== 'solid') out.borderStyle = b.style;
        } else if (value === '0' || value === 'none') {
          out.borderWidth = 0;
        }
        break;
      }
      case 'border-top':
      case 'border-right':
      case 'border-bottom':
      case 'border-left': {
        const side = prop.split('-')[1];
        const cap = side[0].toUpperCase() + side.slice(1);
        const b = parseBorder(value);
        if (b) {
          out[`border${cap}Width`] = b.width;
          out[`border${cap}Color`] = b.color;
        } else if (value === '0' || value === 'none') {
          out[`border${cap}Width`] = 0;
        }
        break;
      }
      case 'border-color':
        out.borderColor = value;
        break;
      case 'border-top-color':
        out.borderTopColor = value;
        break;
      case 'border-right-color':
        out.borderRightColor = value;
        break;
      case 'border-bottom-color':
        out.borderBottomColor = value;
        break;
      case 'border-left-color':
        out.borderLeftColor = value;
        break;
      case 'aspect-ratio': {
        const [w, h] = value.split('/').map((n) => parseFloat(n));
        out.aspectRatio = h ? round(w / h) : w;
        break;
      }
      case 'border-width':
        out.borderWidth = px(value);
        break;
      case 'border-style':
        out.borderStyle = value;
        break;
      case 'border-radius': {
        const parts = value.split(/\s+/).map(px);
        if (parts.length === 1) {
          out.borderRadius = parts[0];
        } else {
          const [tl, tr = tl, br = tl, bl = tr] = parts;
          out.borderTopLeftRadius = tl;
          out.borderTopRightRadius = tr;
          out.borderBottomRightRadius = br;
          out.borderBottomLeftRadius = bl;
        }
        break;
      }

      case 'box-shadow':
        out.boxShadow = value;
        break;

      case 'opacity':
        out.opacity = Number(value);
        break;

      case 'overflow':
      case 'overflow-y':
      case 'overflow-x':
        if (value === 'auto' || value === 'scroll') scroll = true;
        else if (value === 'hidden') out.overflow = 'hidden';
        break;

      case 'font': {
        Object.assign(out, parseFontShorthand(value, notes));
        break;
      }
      case 'font-family':
        out.fontFamily = familyFor(firstFamily(value), out.fontWeight || 400, notes);
        break;
      case 'font-size':
        out.fontSize = px(value);
        break;
      case 'font-weight':
        out.__weight = Number(value);
        break;
      case 'line-height':
        out.lineHeight = px(value);
        break;
      case 'letter-spacing':
        out.__letterSpacingEm = value.endsWith('em') ? parseFloat(value) : null;
        if (!value.endsWith('em')) out.letterSpacing = px(value);
        break;
      case 'text-transform':
        out.textTransform = value;
        break;
      case 'text-align':
        out.textAlign = value;
        break;
      case 'text-decoration':
        out.textDecorationLine = value === 'none' ? 'none' : value;
        break;
      case 'color':
        out.color = value;
        break;

      case 'transform':
        out.transform = parseTransform(value, notes);
        break;

      case 'animation': {
        const m = /^([\w-]+)\s+([\d.]+)(ms|s)\b/.exec(value);
        if (m) {
          animation = {
            name: m[1],
            duration: m[3] === 's' ? Math.round(parseFloat(m[2]) * 1000) : Number(m[2]),
            infinite: /\binfinite\b/.test(value),
          };
        } else {
          notes.push(`unparsed animation: ${value}`);
        }
        break;
      }

      case 'filter': {
        const m = /brightness\(([\d.]+)\)/.exec(value);
        if (m) out.__brightness = Number(m[1]);
        break;
      }

      case 'object-fit':
        out.__objectFit = value;
        break;

      // No RN equivalent and no visual effect on native.
      case 'cursor':
      case 'pointer-events':
      case 'user-select':
      case 'white-space':
      case 'text-overflow':
      case 'resize':
      case 'outline':
      case 'outline-offset':
      case 'appearance':
      case '-webkit-appearance':
      case 'box-sizing':
      case 'text-shadow':
      case 'backdrop-filter':
      case '-webkit-backdrop-filter':
      case 'list-style':
      case 'transition':
      case 'will-change':
      case 'text-wrap':
      case 'word-break':
      case 'overflow-wrap':
      case 'flex-flow':
        break;

      default:
        notes.push(`unhandled property: ${prop}: ${value}`);
    }
  }

  // A CSS flex container lays out in a row unless told otherwise; React Native
  // defaults to a column, so the row has to be made explicit.
  if (isFlex && !hasDirection && !out.__grid) out.flexDirection = 'row';

  // font-weight declared separately from the family
  if (out.__weight !== undefined) {
    if (out.fontFamily) out.fontFamily = reweight(out.fontFamily, out.__weight);
    else out.__pendingWeight = out.__weight;
    delete out.__weight;
  }
  // letter-spacing in em needs the resolved font size
  if (out.__letterSpacingEm != null) {
    out.__letterSpacingEmValue = out.__letterSpacingEm;
    delete out.__letterSpacingEm;
  }

  return { style: out, animation, scroll, notes, flexDeclared: isFlex };
}

function cssAlign(value) {
  if (value === 'flex-start' || value === 'start') return 'flex-start';
  if (value === 'flex-end' || value === 'end') return 'flex-end';
  return value;
}

function cssJustify(value) {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function parseBorder(value) {
  const m = /^([\d.]+)px\s+(solid|dashed|dotted)\s+(.+)$/.exec(value);
  if (!m) return null;
  return { width: parseFloat(m[1]), style: m[2], color: m[3].trim() };
}

function firstFamily(value) {
  const first = value.split(',')[0].trim();
  return first.replace(/^['"]|['"]$/g, '');
}

/** Resolve an SVG `font-family` + `font-weight` pair to a loaded font name. */
export function svgFontFamily(familyList, weight) {
  const family = firstFamily(familyList);
  const table = FONT_FAMILY[family];
  if (!table) return null;
  return table[Number(weight) || 400] || table[400];
}

function familyFor(family, weight, notes) {
  const table = FONT_FAMILY[family];
  if (!table) {
    if (family !== 'monospace' && family !== 'sans-serif') {
      notes.push(`unknown font family: ${family}`);
    }
    return undefined;
  }
  const name = table[weight] || table[400];
  if (!name) notes.push(`no ${family} @ ${weight}`);
  return name;
}

function reweight(fontFamily, weight) {
  for (const table of Object.values(FONT_FAMILY)) {
    for (const [w, name] of Object.entries(table)) {
      if (name === fontFamily) return table[weight] || table[w];
    }
  }
  return fontFamily;
}

// `font: <weight> <size>[/<line-height>] <family-list>`
function parseFontShorthand(value, notes) {
  const m = /^(\d{3})\s+([\d.]+)px(?:\/([\d.]+)px|\/(1))?\s+(.+)$/.exec(value.trim());
  if (!m) {
    notes.push(`unparsed font shorthand: ${value}`);
    return {};
  }
  const weight = Number(m[1]);
  const size = parseFloat(m[2]);
  const family = firstFamily(m[5]);
  const out = { fontSize: size };
  const fontFamily = familyFor(family, weight, notes);
  if (fontFamily) out.fontFamily = fontFamily;
  else out.fontWeight = String(weight);
  if (m[3]) out.lineHeight = parseFloat(m[3]);
  else if (m[4]) out.lineHeight = size; // `/1` — line box equals the font size
  return out;
}

function parseTransform(value, notes) {
  const out = [];
  const re = /([a-zA-Z]+)\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(value))) {
    const fn = m[1];
    const arg = m[2].trim();
    if (fn === 'translateX' || fn === 'translateY') out.push({ [fn]: px(arg) });
    else if (fn === 'scale') out.push({ scale: parseFloat(arg) });
    else if (fn === 'rotate') out.push({ rotate: arg });
    else notes.push(`unhandled transform: ${fn}(${arg})`);
  }
  return out;
}
