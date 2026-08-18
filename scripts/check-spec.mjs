import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/screens/registry.ts', import.meta.url), 'utf8');
const ids = [...source.matchAll(/(?:^|,\s*|\n\s*)s\('(A\d+(?:\.[MS]\d+)?)'/g)].map(match => match[1]);
const unique = new Set(ids);
if (ids.length !== 122) throw new Error(`Expected 122 artboards from section 9.12, found ${ids.length}`);
if (unique.size !== ids.length) throw new Error('The screen registry contains duplicate document IDs');

const required = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15','A16','A17','A18','A19','A20','A21','A22','A23','A24','A25','A26','A27','A28','A29','A30','A31','A32','A33','A34','A35','A36'];
const missing = required.filter(id => !unique.has(id));
if (missing.length) throw new Error(`Missing primary screens: ${missing.join(', ')}`);
console.log(`FleetSync document coverage: ${ids.length} unique artboards, A1–A36 present.`);
