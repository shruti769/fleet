#!/usr/bin/env node
// Generates src/proto/screens/** from the unpacked Claude Design prototype.
//
//   node tools/prototype/generate.mjs [path/to/template.html]
//
// The prototype export is not checked in; point PROTOTYPE_DIR at the unpacked
// bundle. Generated files are checked in, so this only needs re-running when
// the prototype changes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, findAll } from './parse.mjs';
import { Emitter } from './emit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');

const PROTOTYPE_DIR =
  process.argv[2] ||
  process.env.PROTOTYPE_DIR ||
  '/private/tmp/claude-501/-Users-kartikqa-fleet/76ad18c2-9346-4bea-8a87-a5bf7140984a/scratchpad';

const IMAGES = {
  '24983f23-b6e2-4726-8cec-625777cc5938': 'driver',
  'a493a655-14de-4dee-8d68-8ce26637802f': 'primeMover',
  '0c5c8b8f-c338-4b66-a33c-38bd59bf6177': 'tanker',
  '863a3f4d-6490-4a5a-8625-c59fb5a9eaeb': 'allocator',
  '6e47b0de-2fbe-41e9-a091-376331d867b8': 'palletsDock',
  'c744ed77-4c74-4f2d-8329-660394331b29': 'tyreDefect',
  'd71c2cc5-eb55-4a69-9169-7c3f73f4f754': 'depotYard',
  '6e0401f2-636b-4c6a-a1a5-8f4ef3427e35': 'highway',
};

const warnings = [];
const warn = (msg) => warnings.push(msg);

const templatePath = path.join(PROTOTYPE_DIR, 'template.html');
if (!fs.existsSync(templatePath)) {
  console.error(`Prototype template not found at ${templatePath}`);
  console.error('Pass the unpacked bundle directory as the first argument.');
  process.exit(1);
}

const html = fs.readFileSync(templatePath, 'utf8');
const bodyStart = html.indexOf('</helmet>') + '</helmet>'.length;
const bodyEnd = html.indexOf('</x-dc>');
const tree = parse(html.slice(bodyStart, bodyEnd));

const screenBlocks = findAll(tree, (n) => n.name === 'sc-if' && /\{\{\s*s_/.test(n.attrs.value || ''));
const overlayBlocks = findAll(tree, (n) => n.name === 'sc-if' && /\{\{\s*o_/.test(n.attrs.value || ''));

const screensDir = path.join(repo, 'src/proto/screens');
const overlaysDir = path.join(screensDir, 'overlays');
fs.rmSync(screensDir, { recursive: true, force: true });
fs.mkdirSync(overlaysDir, { recursive: true });

const emitter = new Emitter({ images: IMAGES, warn });

const screenIds = [];
const overlayIds = [];

for (const block of screenBlocks) {
  const key = /\{\{\s*(s_[A-Za-z0-9_]+)\s*\}\}/.exec(block.attrs.value)[1].slice(2);
  const id = key.replace(/_/g, '.');
  if (id === 'STUB') continue;
  const root = block.children.find((c) => c.type === 'element');
  if (!root) {
    warn(`screen ${id} has no root element`);
    continue;
  }
  writeComponent({
    id,
    file: path.join(screensDir, `${key}.tsx`),
    root,
    isScreenRoot: true,
  });
  screenIds.push(id);
}

for (const block of overlayBlocks) {
  const key = /\{\{\s*(o_[A-Za-z0-9_]+)\s*\}\}/.exec(block.attrs.value)[1].slice(2);
  const id = key.replace(/_/g, '.');
  const roots = block.children.filter((c) => c.type === 'element');
  if (!roots.length) {
    warn(`overlay ${id} has no root element`);
    continue;
  }
  writeComponent({
    id,
    file: path.join(overlaysDir, `${key}.tsx`),
    root: roots.length === 1 ? roots[0] : { type: 'element', name: 'div', attrs: { style: 'position:absolute;inset:0' }, children: roots },
    isScreenRoot: false,
    isOverlay: true,
  });
  overlayIds.push(id);
}

writeSharedComponent('AppHeader', '4bbe164d-5880-4fa8-8d42-03b4b25dea69.html', {});
writeSharedComponent('TabBar', '27c35f96-638b-4717-b07e-89d54fe1769c.html', {
  bottomInset: true,
});
writeIndex();

console.log(`Generated ${screenIds.length} screens and ${overlayIds.length} overlays.`);
if (warnings.length) {
  const counts = new Map();
  for (const w of warnings) counts.set(w, (counts.get(w) || 0) + 1);
  console.log(`\n${warnings.length} warnings (${counts.size} distinct):`);
  for (const [msg, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}x ${msg}`);
  }
}

/* ------------------------------------------------------------------ */

function writeComponent({ id, file, root, isScreenRoot, isOverlay }) {
  emitter.reset();
  const body = emitter.emitRoot(root, { isScreenRoot });
  const name = 'Screen' + id.replace(/\./g, '_');
  fs.writeFileSync(file, renderFile({ name, body, isOverlay }));
}

function writeSharedComponent(name, asset, { bottomInset }) {
  const file = path.join(PROTOTYPE_DIR, 'assets', asset);
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf('<x-dc>') + '<x-dc>'.length;
  const end = source.indexOf('</x-dc>');
  const subtree = parse(source.slice(start, end));
  const root = subtree.children.find((c) => c.type === 'element');

  emitter.reset();
  const body = emitter.emitRoot(root, { isScreenRoot: false, isBottomBar: !!bottomInset });
  const props = collectProps(subtree);
  const dir = path.join(repo, 'src/proto/components/generated');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${name}.tsx`),
    renderFile({ name: `${name}View`, body, props, isComponent: true }),
  );
}

/** Prop names referenced by a shared component's markup. */
function collectProps(subtree) {
  const props = new Set();
  const re = /\{\{\s*([A-Za-z_$][\w$]*)/g;
  const scan = (node) => {
    if (node.type === 'element') {
      for (const value of Object.values(node.attrs)) {
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(value))) props.add(m[1]);
      }
    }
    if (node.type === 'text') {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(node.value))) props.add(m[1]);
    }
    for (const child of node.children || []) scan(child);
  };
  scan(subtree);
  props.delete('true');
  props.delete('false');
  return [...props].sort();
}

function renderFile({ name, body, props, isComponent, isOverlay }) {
  const rn = ['View', 'Text'];
  if (emitter.usesPressable) rn.push('Pressable');
  if (emitter.usesScrollView) rn.push('ScrollView');
  if (emitter.usesImage) rn.push('Image');
  if (emitter.usesTextInput) rn.push('TextInput');
  rn.push('StyleSheet');

  const lines = [];
  lines.push(`// Generated by tools/prototype/generate.mjs — do not edit by hand.`);
  lines.push(`import React from 'react';`);
  lines.push(`import { ${[...new Set(rn)].join(', ')} } from 'react-native';`);

  const svg = [...emitter.svgTags];
  if (svg.length) {
    const rest = svg.filter((t) => t !== 'Svg').sort();
    const named = rest.map((t) => (t === 'SvgText' ? 'Text as SvgText' : t));
    lines.push(
      `import Svg${named.length ? `, { ${named.join(', ')} }` : ''} from 'react-native-svg';`,
    );
  }
  if (emitter.usesInsets) {
    lines.push(`import { useSafeAreaInsets } from 'react-native-safe-area-context';`);
  }
  if (emitter.usesAnim) lines.push(`import { Anim } from '@/proto/theme/anim';`);
  if (emitter.usesImage) lines.push(`import { IMG } from '@/proto/theme/images';`);
  for (const component of [...emitter.components].sort()) {
    lines.push(`import { ${component} } from '@/proto/components/${component}';`);
  }
  if (!isComponent) {
    lines.push(`import { useVals } from '@/proto/runtime/vals';`);
  } else {
    lines.push(`import { useVals } from '@/proto/runtime/vals';`);
  }
  lines.push('');

  if (isComponent) {
    const propList = (props || []).filter((p) => p !== 'v');
    lines.push(`export type ${name}Props = {`);
    for (const prop of propList) lines.push(`  ${prop}?: any;`);
    lines.push(`};`);
    lines.push('');
    lines.push(`export function ${name}(v: ${name}Props) {`);
  } else {
    lines.push(`export default function ${name}() {`);
    lines.push(`  const v = useVals();`);
  }
  if (emitter.usesInsets) lines.push(`  const insets = useSafeAreaInsets();`);
  lines.push(`  return (`);
  lines.push(body);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push('');
  const sheet = emitter.styleSheetSource();
  if (sheet) lines.push(sheet);

  let source = lines.join('\n');
  if (!isComponent && !/\bv\./.test(body)) {
    source = source.replace('  const v = useVals();\n', '');
    source = source.replace(`import { useVals } from '@/proto/runtime/vals';\n`, '');
  }
  if (isComponent && !/\bv\./.test(body)) {
    source = source.replace(`import { useVals } from '@/proto/runtime/vals';\n`, '');
  } else if (isComponent) {
    source = source.replace(`import { useVals } from '@/proto/runtime/vals';\n`, '');
  }
  if (!/React\./.test(source) && !/<>/.test(source)) {
    source = source.replace(`import React from 'react';\n`, '');
  }
  return source;
}

function writeIndex() {
  const lines = [
    `// Generated by tools/prototype/generate.mjs — do not edit by hand.`,
    `import type { ComponentType } from 'react';`,
    '',
  ];
  const imports = [];
  const screenEntries = [];
  const overlayEntries = [];

  for (const id of screenIds) {
    const key = id.replace(/\./g, '_');
    imports.push(`import Screen_${key} from './${key}';`);
    screenEntries.push(`  '${id}': Screen_${key},`);
  }
  for (const id of overlayIds) {
    const key = id.replace(/\./g, '_');
    imports.push(`import Overlay_${key} from './overlays/${key}';`);
    overlayEntries.push(`  '${id}': Overlay_${key},`);
  }

  lines.push(...imports, '');
  lines.push(`export const screens: Record<string, ComponentType> = {`);
  lines.push(...screenEntries);
  lines.push(`};`, '');
  lines.push(`export const overlays: Record<string, ComponentType> = {`);
  lines.push(...overlayEntries);
  lines.push(`};`, '');
  lines.push(`export const SCREEN_IDS = [`);
  lines.push(screenIds.map((id) => `  '${id}',`).join('\n'));
  lines.push(`] as const;`, '');
  lines.push(`export const OVERLAY_IDS = [`);
  lines.push(overlayIds.map((id) => `  '${id}',`).join('\n'));
  lines.push(`] as const;`, '');
  lines.push(`export type ScreenId = (typeof SCREEN_IDS)[number];`);
  lines.push(`export type OverlayId = (typeof OVERLAY_IDS)[number];`);
  lines.push(`export type AnyId = ScreenId | OverlayId;`);
  lines.push('');

  fs.writeFileSync(path.join(screensDir, 'index.ts'), lines.join('\n'));
}
