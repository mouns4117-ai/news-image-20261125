// News-image entry (Node 22, standard library only): the program copies the
// image the repository holds to /output/entry.png. The image is a front-page
// infographic summing up Wednesday 25 November 2026 world news, drawn in the
// agent session that built this entry. The program runs with no network and
// writes the same bytes on every run: it only copies the shipped file.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
// Fail fast: the shipped image must exist, be a whole PNG, and fit the gate
// (at most 1 MiB and 1024 by 1024 pixels).
const src = new URL('./entry.png', import.meta.url);
const bytes = readFileSync(src);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a whole PNG file');
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}
// Empty /output by contents only; never remove the directory itself.
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
copyFileSync(src, join(outDir, 'entry.png'));
