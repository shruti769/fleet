// Asserts the app covers every artboard in the FleetSync prototype.
//
// The prototype defines 98 base screens and 45 overlays; each one must have a
// generated component and be reachable from the screen registry.

import { readFileSync, existsSync } from 'node:fs';

const index = readFileSync(new URL('../src/proto/screens/index.ts', import.meta.url), 'utf8');

const listOf = (name) => {
  const block = new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const;`).exec(index);
  if (!block) throw new Error(`${name} is missing from src/proto/screens/index.ts`);
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
};

const screenIds = listOf('SCREEN_IDS');
const overlayIds = listOf('OVERLAY_IDS');

const EXPECTED_SCREENS = 98;
const EXPECTED_OVERLAYS = 45;

if (screenIds.length !== EXPECTED_SCREENS) {
  throw new Error(`Expected ${EXPECTED_SCREENS} screens, found ${screenIds.length}`);
}
if (overlayIds.length !== EXPECTED_OVERLAYS) {
  throw new Error(`Expected ${EXPECTED_OVERLAYS} overlays, found ${overlayIds.length}`);
}

const all = [...screenIds, ...overlayIds];
if (new Set(all).size !== all.length) {
  throw new Error('The screen registry contains duplicate artboard ids');
}

// Every primary artboard the brief calls out must be present.
const required = [
  ...Array.from({ length: 36 }, (_, i) => `A${i + 1}`).filter(
    // A3 and the ids the prototype never used are not artboards.
    (id) => !['A3'].includes(id),
  ),
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'C1',
  'C2',
  'C3',
  'C4',
];
const missing = required.filter((id) => !screenIds.includes(id));
if (missing.length) throw new Error(`Missing primary screens: ${missing.join(', ')}`);

// Each id must have a file behind it.
for (const id of screenIds) {
  const file = new URL(`../src/proto/screens/${id.replace(/\./g, '_')}.tsx`, import.meta.url);
  if (!existsSync(file)) throw new Error(`Missing screen component for ${id}`);
}
for (const id of overlayIds) {
  const file = new URL(
    `../src/proto/screens/overlays/${id.replace(/\./g, '_')}.tsx`,
    import.meta.url,
  );
  if (!existsSync(file)) throw new Error(`Missing overlay component for ${id}`);
}

console.log(
  `FleetSync coverage: ${screenIds.length} screens + ${overlayIds.length} overlays = ${all.length} artboards.`,
);
