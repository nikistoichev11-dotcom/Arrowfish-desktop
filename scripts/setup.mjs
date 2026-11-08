// Downloads Stockfish (WASM, single-thread) from npm into ./engine as stockfish.js + stockfish.wasm
import { execSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';

const dest = path.resolve('engine'); fs.mkdirSync(dest, { recursive: true });
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arrowfish-'));
execSync('npm pack stockfish --silent', { cwd: tmp, stdio: 'ignore' });
const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
execSync(`tar -xzf "${tgz}"`, { cwd: tmp });
const files = walk(path.join(tmp, 'package'));
const cands = files
  .filter((f) => f.endsWith('.js') && /single/.test(path.basename(f)) && fs.existsSync(f.replace(/\.js$/, '.wasm')))
  .sort((a, b) => (/lite/.test(path.basename(b)) ? 1 : 0) - (/lite/.test(path.basename(a)) ? 1 : 0));
if (!cands.length) { console.error('No single-thread WASM build found in the stockfish package. See MANUAL.md ("Manual engine install").'); process.exit(1); }
fs.copyFileSync(cands[0], path.join(dest, 'stockfish.js'));
fs.copyFileSync(cands[0].replace(/\.js$/, '.wasm'), path.join(dest, 'stockfish.wasm'));
console.log('Installed', path.basename(cands[0]), '->', dest);
