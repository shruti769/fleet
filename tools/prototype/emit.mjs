// Prototype element tree -> React Native JSX.

import {
  convert,
  INSET_BOTTOM,
  INSET_TOP,
  TEXT_PROPS,
  CONTENT_PROPS,
  svgFontFamily,
} from './css.mjs';

const INLINE_TEXT_TAGS = new Set(['span', 'strong', 'label', 'em', 'b', 'i']);

// Box styling that a bare <Text> cannot reproduce faithfully (vertical
// centring, padded backgrounds, fixed boxes). When present the element becomes
// a <View> with the text nested inside it.
const BOX_KEYS = [
  'backgroundColor',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'height',
  'minHeight',
  'alignItems',
  'justifyContent',
  'gap',
  'position',
  // Flex sizing on a bare <Text> is unreliable across platforms; give it a
  // <View> to size against instead.
  'flex',
  'flexGrow',
  'flexBasis',
  'alignSelf',
  'width',
  'maxWidth',
  'minWidth',
];

const SVG_TAG = {
  svg: 'Svg',
  path: 'Path',
  circle: 'Circle',
  rect: 'Rect',
  g: 'G',
  polygon: 'Polygon',
  polyline: 'Polyline',
  line: 'Line',
  ellipse: 'Ellipse',
  text: 'SvgText',
  tspan: 'TSpan',
  defs: 'Defs',
  lineargradient: 'LinearGradient',
  stop: 'Stop',
  clippath: 'ClipPath',
  mask: 'Mask',
  use: 'Use',
};

export class Emitter {
  constructor({ images, warn }) {
    this.images = images;
    this.warn = warn || (() => {});
    this.styles = new Map(); // serialized -> name
    this.usesInsets = false;
    this.usesImage = false;
    this.usesTextInput = false;
    this.usesScrollView = false;
    this.usesPressable = false;
    this.usesAnim = false;
    this.svgTags = new Set();
    this.components = new Set();
    this.usesFragment = false;
  }

  reset() {
    this.styles = new Map();
    this.usesInsets = false;
    this.usesImage = false;
    this.usesTextInput = false;
    this.usesScrollView = false;
    this.usesPressable = false;
    this.usesAnim = false;
    this.svgTags = new Set();
    this.components = new Set();
    this.usesFragment = false;
  }

  styleName(obj) {
    const key = stableJson(obj);
    if (!this.styles.has(key)) this.styles.set(key, `s${this.styles.size}`);
    return this.styles.get(key);
  }

  styleSheetSource() {
    if (this.styles.size === 0) return '';
    const entries = [...this.styles.entries()].map(
      ([json, name]) => `  ${name}: ${literal(JSON.parse(json), 1)},`,
    );
    return `const s = StyleSheet.create({\n${entries.join('\n')}\n});\n`;
  }

  /** Emit a screen or overlay body. */
  emitRoot(node, { isScreenRoot, isBottomBar }) {
    return this.emit(node, {
      scope: new Set(),
      inh: {},
      color: '#0F1B2A',
      isScreenRoot,
      isBottomBar,
      indent: 2,
    });
  }

  emit(node, ctx) {
    if (node.type === 'text') {
      const parts = textParts(node.value, ctx.scope);
      return parts;
    }
    if (node.type !== 'element') return '';

    const name = node.name;

    if (name === 'sc-if') return this.emitScIf(node, ctx);
    if (name === 'sc-for') return this.emitScFor(node, ctx);
    if (name === 'dc-import') return this.emitImport(node, ctx);
    if (SVG_TAG[name]) return this.emitSvg(node, ctx);
    if (name === 'img') return this.emitImg(node, ctx);
    if (name === 'input' || name === 'textarea') return this.emitInput(node, ctx);
    if (node.attrs && node.attrs['data-slot']) return '';

    return this.emitBox(node, ctx);
  }

  emitScIf(node, ctx) {
    const cond = ref(binding(node.attrs.value), ctx.scope);
    const inner = this.emitChildren(node, { ...ctx, indent: ctx.indent + 1 });
    if (!inner.trim()) return '';
    const pad = '  '.repeat(ctx.indent);
    const multiple = countTopLevelChildren(node) > 1;
    if (multiple) this.usesFragment = true;
    const body = multiple ? `<>\n${inner}\n${pad}  </>` : inner.trim();
    return `${pad}{${cond} ? (\n${pad}  ${body}\n${pad}) : null}`;
  }

  emitScFor(node, ctx) {
    const list = ref(binding(node.attrs.list), ctx.scope);
    const item = node.attrs.as;
    const idx = `${item}I`;
    const scope = new Set([...ctx.scope, item, idx]);
    const inner = this.emitChildren(node, { ...ctx, scope, indent: ctx.indent + 2 });
    const pad = '  '.repeat(ctx.indent);
    this.usesFragment = true;
    return (
      `${pad}{${list}.map((${item}, ${idx}) => (\n` +
      `${pad}    <React.Fragment key={${idx}}>\n${inner}\n${pad}    </React.Fragment>\n` +
      `${pad}))}`
    );
  }

  emitImport(node, ctx) {
    const component = node.attrs.name;
    this.components.add(component);
    const pad = '  '.repeat(ctx.indent);
    const props = [];
    for (const [key, value] of Object.entries(node.attrs)) {
      if (key === 'name' || key.startsWith('hint-')) continue;
      const prop = camel(key);
      const b = binding(value);
      if (b !== null) props.push(`${prop}={${ref(b, ctx.scope)}}`);
      else props.push(`${prop}=${JSON.stringify(value)}`);
    }
    return `${pad}<${component} ${props.join(' ')} />`;
  }

  /** A grid child shares the row equally, whatever element it happens to be. */
  applyGridChild(style, ctx) {
    if (!ctx.gridFlex && !ctx.gridBasis) return;
    // In CSS `width:100%` meant the grid cell; here the track sizing does that
    // job, and a literal 100% would claim the whole row.
    if (style.width === '100%') delete style.width;
    if (ctx.gridFlex) {
      // Longhands rather than `flex: 1`: some components ship their own
      // flexBasis, and an `auto` basis lets intrinsic size win the track.
      style.flexGrow ??= 1;
      style.flexShrink ??= 1;
      style.flexBasis = 0;
    }
    if (ctx.gridBasis) style.flexBasis = ctx.gridBasis;
  }

  emitImg(node, ctx) {
    this.usesImage = true;
    const { style } = convert(node.attrs.style);
    this.applyGridChild(style, ctx);
    const resizeMode = style.__objectFit === 'cover' ? 'cover' : 'contain';
    const brightness = style.__brightness;
    const clean = this.finishStyle(style, ctx, { isText: false });
    const pad = '  '.repeat(ctx.indent);
    const source = this.images[node.attrs.src];
    if (!source) this.warn(`no image mapping for ${node.attrs.src}`);
    const alt = node.attrs.alt ? ` accessibilityLabel=${JSON.stringify(node.attrs.alt)}` : '';

    // An <Image> sized by aspect-ratio alone is not reliable — its own content
    // can win the height. A wrapper owns the box; the image just fills it.
    if (style.aspectRatio !== undefined && brightness == null) {
      const box = { ...style, overflow: 'hidden' };
      delete box.__objectFit;
      const boxStyle = this.finishStyle(box, ctx, { isText: false });
      const fill = this.styleName({ width: '100%', height: '100%' });
      return (
        `${pad}<View style={${boxStyle.expr}}>\n` +
        `${pad}  <Image source={IMG.${source || 'driver'}} resizeMode="${resizeMode}"${alt} style={s.${fill}} />\n` +
        `${pad}</View>`
      );
    }

    const img = `${pad}<Image source={IMG.${source || 'driver'}} resizeMode="${resizeMode}"${alt} style={${clean.expr}} />`;
    if (brightness == null) return img;
    // CSS `filter: brightness(x)` -> a black scrim at 1 - x.
    const scrim = this.styleName({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: rgba(0, 0, 0, round(1 - brightness)),
    });
    return `${img}\n${pad}<View pointerEvents="none" style={s.${scrim}} />`;
  }

  emitInput(node, ctx) {
    this.usesTextInput = true;
    const multiline = node.name === 'textarea';
    const { style } = convert(node.attrs.style);
    this.applyGridChild(style, ctx);
    const merged = { ...ctx.inh, ...style };
    const clean = this.finishStyle(merged, ctx, { input: true });
    const pad = '  '.repeat(ctx.indent);
    const props = [`style={${clean.expr}}`];
    // The prototype reads two inputs back through a ref; in React Native those
    // become controlled fields backed by draft state.
    const boundRef = binding(node.attrs.ref);
    if (boundRef) {
      const target = ref(boundRef, ctx.scope);
      props.push(`value={${target}.value}`, `onChangeText={${target}.onChangeText}`);
    }
    const value = node.attrs['sc-camel-default-value'] ?? node.attrs.value;
    if (value && !boundRef) props.push(`defaultValue=${JSON.stringify(value)}`);
    if (node.attrs.placeholder) {
      props.push(`placeholder=${JSON.stringify(node.attrs.placeholder)}`);
      props.push(`placeholderTextColor="#94A3B8"`);
    }
    if (node.attrs.type === 'password') props.push('secureTextEntry');
    if (node.attrs.type === 'email') {
      props.push('keyboardType="email-address"', 'autoCapitalize="none"');
    }
    if (node.attrs.type === 'tel') props.push('keyboardType="phone-pad"');
    if (node.attrs.type === 'number') props.push('keyboardType="number-pad"');
    if (multiline) {
      props.push('multiline');
      props.push('textAlignVertical="top"');
      if (node.attrs.rows) props.push(`numberOfLines={${node.attrs.rows}}`);
    }
    return `${pad}<TextInput ${props.join(' ')} />`;
  }

  emitSvg(node, ctx) {
    const tag = SVG_TAG[node.name];
    this.svgTags.add(tag);
    const pad = '  '.repeat(ctx.indent);
    const props = [];
    for (const [key, raw] of Object.entries(node.attrs)) {
      if (key === 'style' || key.startsWith('hint-')) continue;
      // An SVG font-family has to name a font the app actually loaded, and the
      // weight is part of that name.
      if (key === 'font-family') {
        const resolved = svgFontFamily(raw, node.attrs['font-weight']);
        if (resolved) {
          props.push(`fontFamily=${JSON.stringify(resolved)}`);
          continue;
        }
      }
      if (key === 'font-weight' && svgFontFamily(node.attrs['font-family'] || '', raw)) continue;
      const prop = camel(key);
      const value = raw === 'currentColor' ? ctx.color : raw;
      if ((prop === 'width' || prop === 'height') && /^[\d.]+$/.test(value)) {
        props.push(`${prop}={${value}}`);
      } else {
        props.push(`${prop}=${JSON.stringify(value)}`);
      }
    }
    // Inside an <Svg> a bare text node belongs to SvgText, not an RN <Text>.
    const inner = this.emitChildren(node, {
      ...ctx,
      wrapBareText: false,
      indent: ctx.indent + 1,
    });
    const open = `${pad}<${tag}${props.length ? ' ' + props.join(' ') : ''}`;
    if (!inner.trim()) return `${open} />`;
    return `${open}>\n${inner}\n${pad}</${tag}>`;
  }

  emitBox(node, ctx) {
    const converted = convert(node.attrs.style);
    if (converted.notes.length) {
      for (const n of converted.notes) this.warn(`${node.name}: ${n}`);
    }
    const style = converted.style;
    let animation = converted.animation;
    let scroll = converted.scroll;

    // The navigator owns the push transition, so the screen's own slide-in is
    // dropped rather than played twice.
    if (ctx.isScreenRoot && animation && animation.name === 'scrIn') animation = null;

    if (ctx.isScreenRoot) {
      // The route already fills the window, and the push transition is the
      // navigator's job — `position:absolute;inset:0` plus `scrIn` are dropped.
      if (style.position === 'absolute' && style.top === 0 && style.bottom === 0) {
        delete style.position;
        delete style.top;
        delete style.right;
        delete style.bottom;
        delete style.left;
        style.flex = 1;
      }
    }

    // An empty 54px-tall box is the prototype's status bar spacer.
    if (style.height === 54 && !node.children.some((c) => hasContent(c) || c.type === 'element')) {
      style.height = INSET_TOP;
    }

    // Anything that sits against the bottom of the window has to clear the
    // home indicator, which the prototype drew itself (plan decision 1).
    const dockedToBottom =
      style.position === 'absolute' && style.bottom === 0 && style.top === undefined;
    const isBottomBar = ctx.bottomBarChild === node && style.flexGrow === 0;
    if (
      typeof style.paddingBottom === 'number' &&
      (ctx.isScreenRoot || dockedToBottom || isBottomBar)
    ) {
      style.paddingBottom = `MAX_INSET_BOTTOM:${style.paddingBottom}`;
    }

    // A browser centres a <button>'s label both ways by default; a Pressable
    // does not, so the default has to be written out.
    if (
      node.name === 'button' &&
      !converted.flexDeclared &&
      style.textAlign === undefined &&
      node.children.length > 0 &&
      node.children.every((c) => isTextish(c))
    ) {
      style.flexDirection = 'row';
      style.alignItems ??= 'center';
      style.justifyContent ??= 'center';
      style.textAlign = 'center';
    }

    const ownText = pick(style, TEXT_PROPS);
    resolveEmSpacing(ownText, style, ctx.inh);
    const inh = { ...ctx.inh, ...ownText };
    const color = ownText.color || ctx.color;

    const elementChildren = node.children.filter((c) => c.type === 'element');
    const lastElementChild = elementChildren[elementChildren.length - 1];

    const childCtx = {
      ...ctx,
      inh,
      color,
      isScreenRoot: false,
      isBottomBar: false,
      // Only the <View> branch below turns this back on; inside a <Text> the
      // text nodes are already in a text context.
      wrapBareText: false,
      gridFlex: false,
      gridBasis: undefined,
      // A screen's last fixed-height child is its action bar.
      bottomBarChild: ctx.isScreenRoot ? lastElementChild : undefined,
      indent: ctx.indent + 1,
    };

    // Grid -> row of equal-width children.
    if (style.__grid) {
      const cols = style.__gridColumns || 1;
      const kids = node.children.filter((c) => c.type === 'element');
      style.flexDirection = 'row';
      if (kids.length > cols) {
        style.flexWrap = 'wrap';
        childCtx.gridBasis = `${round(100 / cols)}%`;
        this.warn(`grid with ${kids.length} children over ${cols} columns needs review`);
      } else {
        childCtx.gridFlex = true;
      }
      // A stretched row would let an aspect-ratio child derive its width from
      // the row height instead of the other way round.
      if (kids.some((k) => /aspect-ratio/.test(k.attrs.style || ''))) {
        style.alignItems ??= 'flex-start';
      }
    }
    delete style.__grid;
    delete style.__gridColumns;

    this.applyGridChild(style, ctx);

    const asText = this.shouldBeText(node, style);
    const isPressable = node.name === 'button' || (node.name === 'a' && node.attrs.onclick);

    if (asText) {
      // Inherited type, plus this element's own margins and opacity.
      const clean = this.finishStyle({ ...inh, ...style }, ctx, { isText: true });
      const inner = this.emitChildren(node, childCtx);
      const pad = '  '.repeat(ctx.indent);
      const props = [`style={${clean.expr}}`];
      if (isEllipsised(node.attrs.style)) props.push('numberOfLines={1}');
      if (!inner.trim()) return `${pad}<Text ${props.join(' ')} />`;
      return `${pad}<Text ${props.join(' ')}>\n${inner}\n${pad}</Text>`;
    }

    const clean = this.finishStyle(style, ctx, { isText: false, scroll });
    const inner = this.emitChildren(node, { ...childCtx, wrapBareText: true });
    const pad = '  '.repeat(ctx.indent);

    let tag = 'View';
    const props = [];

    if (isPressable) {
      this.usesPressable = true;
      tag = 'Pressable';
      const handler = binding(node.attrs.onclick);
      if (handler) props.push(`onPress={${ref(handler, ctx.scope)}}`);
      const active = node.attrs['style-active'];
      if (active) {
        const activeStyle = convert(active).style;
        const activeName = this.styleName(activeStyle);
        props.push(
          `style={({ pressed }) => [${clean.expr}, pressed && s.${activeName}]}`,
        );
      } else {
        props.push(`style={${clean.expr}}`);
      }
    } else if (scroll) {
      if (animation) {
        this.usesAnim = true;
        tag = 'Anim';
        props.push('scroll');
        props.push(`name="${animation.name}"`);
        props.push(`duration={${animation.duration}}`);
        if (animation.infinite) props.push('loop');
      } else {
        this.usesScrollView = true;
        tag = 'ScrollView';
      }
      props.push(`style={${clean.expr}}`);
      if (clean.contentExpr) props.push(`contentContainerStyle={${clean.contentExpr}}`);
      props.push('showsVerticalScrollIndicator={false}');
    } else if (animation) {
      this.usesAnim = true;
      tag = 'Anim';
      props.push(`name="${animation.name}"`);
      props.push(`duration={${animation.duration}}`);
      if (animation.infinite) props.push('loop');
      props.push(`style={${clean.expr}}`);
    } else {
      if (clean.expr !== 'undefined') props.push(`style={${clean.expr}}`);
    }

    if (animation && tag !== 'Anim' && animation.name !== 'scrIn') {
      this.warn(`animation ${animation.name} on <${tag}> was dropped`);
    }
    if (node.attrs['pointer-events'] === 'none' || /pointer-events:\s*none/.test(node.attrs.style || '')) {
      props.push('pointerEvents="none"');
    }

    const open = `${pad}<${tag}${props.length ? ' ' + props.join(' ') : ''}`;
    if (!inner.trim()) return `${open} />`;
    return `${open}>\n${inner}\n${pad}</${tag}>`;
  }

  shouldBeText(node, style) {
    if (node.name === 'button') return false;
    if (!node.children.length) return false;
    const allTextish = node.children.every((c) => isTextish(c));
    if (!allTextish) return false;
    if (!node.children.some((c) => hasContent(c))) return false;
    if (INLINE_TEXT_TAGS.has(node.name)) {
      // Inline elements only become Views when they carry real box styling.
      return !BOX_KEYS.some((k) => style[k] !== undefined);
    }
    return !BOX_KEYS.some((k) => style[k] !== undefined);
  }

  emitChildren(node, ctx) {
    const out = [];
    for (const child of node.children) {
      if (child.type === 'text') {
        const parts = textParts(child.value, ctx.scope);
        if (!parts) continue;
        const pad = '  '.repeat(ctx.indent);
        if (ctx.wrapBareText) {
          const clean = this.finishStyle({ ...ctx.inh }, ctx, { isText: true });
          out.push(`${pad}<Text style={${clean.expr}}>${parts}</Text>`);
        } else {
          out.push(`${pad}${parts}`);
        }
        continue;
      }
      const emitted = this.emit(child, ctx);
      if (emitted && emitted.trim()) out.push(emitted);
    }
    return out.join('\n');
  }

  /**
   * Turn a style object into a JSX style expression, moving safe-area values
   * out of the StyleSheet (they depend on runtime insets).
   */
  finishStyle(style, ctx, { isText, scroll, input }) {
    const s = { ...style };

    // Data-bound declarations (`width:{{ qPct }}`) resolve at render time.
    const bound = {};
    for (const key of Object.keys(s)) {
      if (!key.startsWith('__dyn_')) continue;
      const prop = key.slice(6);
      const expr = ref(s[key], ctx.scope);
      bound[prop] = prop === 'transform' ? `[{ scale: ${expr} }]` : expr;
      delete s[key];
    }

    for (const key of Object.keys(s)) if (key.startsWith('__')) delete s[key];

    // A TextInput takes both box and text styles, so nothing is stripped.
    if (input) {
      // keep everything
    } else if (isText) {
      const KEEP = [
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'flex',
        'flexGrow',
        'flexShrink',
        'opacity',
        'width',
        'maxWidth',
      ];
      for (const key of Object.keys(s)) {
        if (!TEXT_PROPS.has(key) && !KEEP.includes(key)) delete s[key];
      }
    } else {
      // Text properties are inherited into the nested <Text>s; a ViewStyle has
      // no use for them.
      for (const key of Object.keys(s)) if (TEXT_PROPS.has(key)) delete s[key];
    }

    const dynamic = { ...bound };
    for (const [key, value] of Object.entries(s)) {
      if (value === INSET_TOP) {
        dynamic[key] = 'insets.top';
        delete s[key];
        this.usesInsets = true;
      } else if (value === INSET_BOTTOM) {
        dynamic[key] = 'insets.bottom';
        delete s[key];
        this.usesInsets = true;
      } else if (typeof value === 'string' && value.startsWith('MAX_INSET_BOTTOM:')) {
        dynamic[key] = `Math.max(${value.split(':')[1]}, insets.bottom)`;
        delete s[key];
        this.usesInsets = true;
      }
    }

    let content = null;
    if (scroll) {
      // The prototype's scroll boxes are `flex:1` columns, so their children
      // can use flex spacers. A ScrollView only behaves that way when its
      // content container is allowed to grow to the viewport.
      content = { flexGrow: 1 };
      for (const key of Object.keys(s)) {
        if (CONTENT_PROPS.has(key)) {
          content[key] = s[key];
          delete s[key];
        }
      }
      for (const key of Object.keys(dynamic)) {
        if (CONTENT_PROPS.has(key)) {
          content[`__dyn_${key}`] = dynamic[key];
          delete dynamic[key];
        }
      }
    }

    const expr = this.styleExpr(s, dynamic);
    const contentExpr = content ? this.styleExprFromMixed(content) : null;
    return { expr, contentExpr };
  }

  styleExpr(staticStyle, dynamic) {
    const hasStatic = Object.keys(staticStyle).length > 0;
    const hasDynamic = Object.keys(dynamic).length > 0;
    if (!hasStatic && !hasDynamic) return 'undefined';
    if (!hasDynamic) return `s.${this.styleName(staticStyle)}`;
    const dyn = `{ ${Object.entries(dynamic)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')} }`;
    if (!hasStatic) return dyn;
    return `[s.${this.styleName(staticStyle)}, ${dyn}]`;
  }

  styleExprFromMixed(mixed) {
    const staticStyle = {};
    const dynamic = {};
    for (const [key, value] of Object.entries(mixed)) {
      if (key.startsWith('__dyn_')) dynamic[key.slice(6)] = value;
      else staticStyle[key] = value;
    }
    return this.styleExpr(staticStyle, dynamic);
  }
}

/* ------------------------------------------------------------------ */

function isTextish(node) {
  if (node.type === 'text') return true;
  if (node.type !== 'element') return false;
  if (!INLINE_TEXT_TAGS.has(node.name)) return false;
  // `display:block` on a span makes it a block box: it must not be folded into
  // the surrounding <Text>, or the lines run together.
  const display = /display:\s*([\w-]+)/.exec(node.attrs.style || '');
  if (display && display[1] !== 'inline') return false;
  return node.children.every((c) => isTextish(c));
}

function hasContent(node) {
  if (node.type === 'text') return node.value.trim().length > 0;
  return (node.children || []).some((c) => hasContent(c));
}

function countTopLevelChildren(node) {
  return node.children.filter(
    (c) => c.type === 'element' || (c.type === 'text' && c.value.trim()),
  ).length;
}

function isEllipsised(style) {
  return /text-overflow:\s*ellipsis/.test(style || '');
}

/** `{{ expr }}` -> a binding string, or null when the value is a literal. */
function binding(value) {
  if (value == null) return null;
  const m = /^\{\{\s*(.+?)\s*\}\}$/.exec(value.trim());
  return m ? m[1] : null;
}

/** Qualify an expression with `v.` unless it starts with a loop variable. */
function ref(expr, scope) {
  if (expr == null) return 'undefined';
  const trimmed = expr.trim();
  if (trimmed === 'true' || trimmed === 'false' || /^-?[\d.]+$/.test(trimmed)) return trimmed;
  const head = /^([A-Za-z_$][\w$]*)/.exec(trimmed);
  if (head && scope.has(head[1])) return trimmed;
  return `v.${trimmed}`;
}

/** Text with `{{ }}` holes -> a JSX children string. */
function textParts(raw, scope) {
  const text = raw.replace(/\s+/g, ' ');
  if (!text.trim()) return '';
  const out = [];
  const re = /\{\{\s*(.+?)\s*\}\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(jsxText(text.slice(last, m.index)));
    out.push(`{${ref(m[1], scope)}}`);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(jsxText(text.slice(last)));
  return out.join('');
}

function jsxText(text) {
  if (!text) return '';
  if (/[{}<>]/.test(text)) return `{${JSON.stringify(text)}}`;
  return text;
}

function pick(obj, keys) {
  const out = {};
  for (const key of keys) if (obj[key] !== undefined) out[key] = obj[key];
  if (obj.__pendingWeight !== undefined) out.fontWeight = String(obj.__pendingWeight);
  if (obj.__letterSpacingEmValue !== undefined) {
    out.__letterSpacingEmValue = obj.__letterSpacingEmValue;
  }
  return out;
}

function resolveEmSpacing(ownText, style, inherited) {
  if (ownText.__letterSpacingEmValue === undefined) return;
  const size = ownText.fontSize ?? style.fontSize ?? inherited.fontSize ?? 16;
  ownText.letterSpacing = round(ownText.__letterSpacingEmValue * size);
  delete ownText.__letterSpacingEmValue;
  delete style.__letterSpacingEmValue;
}

function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

// `sc-camel-view-box` is how the prototype escapes a camelCase SVG attribute.
function camel(name) {
  return name.replace(/^sc-camel-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function stableJson(obj) {
  const keys = Object.keys(obj).sort();
  const sorted = {};
  for (const key of keys) sorted[key] = obj[key];
  return JSON.stringify(sorted);
}

function literal(obj, depth) {
  const pad = '  '.repeat(depth + 1);
  const close = '  '.repeat(depth);
  const entries = Object.entries(obj).map(([key, value]) => {
    const k = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `${pad}${k}: ${valueLiteral(value, depth + 1)},`;
  });
  if (!entries.length) return '{}';
  return `{\n${entries.join('\n')}\n${close}}`;
}

function valueLiteral(value, depth) {
  if (Array.isArray(value)) {
    return `[${value.map((v) => valueLiteral(v, depth)).join(', ')}]`;
  }
  if (value && typeof value === 'object') return literal(value, depth);
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
}

export { binding, ref, camel, literal };
