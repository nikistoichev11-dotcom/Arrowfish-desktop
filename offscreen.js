// Hosts Stockfish (WASM, single-thread). Run `node scripts/setup.mjs` to download engine/stockfish.js + .wasm.
const sf = new Worker('engine/stockfish.js');
let busy = null, next = null, lines = {};
sf.postMessage('uci');

function run(job) {
  busy = job; lines = {};
  sf.postMessage(`setoption name MultiPV value ${job.lines}`);
  sf.postMessage(`position fen ${job.fen}`);
  sf.postMessage(`go depth ${job.depth}`);
}
function submit(job) {
  if (busy) {
    if (next) next.resolve({ id: next.id, lines: [] });
    next = job; sf.postMessage('stop');
  } else run(job);
}
sf.onmessage = (e) => {
  const l = String(e.data);
  if (!busy) return;
  if (l.startsWith('info') && / pv /.test(l)) {
    const mp = / multipv (\d+)/.exec(l), pv = / pv (\S+)/.exec(l), sc = / score (cp|mate) (-?\d+)/.exec(l);
    if (pv && sc) lines[mp ? mp[1] : '1'] = { pv: pv[1], kind: sc[1], score: +sc[2] };
  } else if (l.startsWith('bestmove')) {
    const done = busy; busy = null;
    done.resolve({ id: done.id, lines: Object.keys(lines).sort().map((k) => lines[k]) });
    if (next) { const n = next; next = null; run(n); }
  }
};
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.target !== 'offscreen' || msg.type !== 'analyze') return;
  new Promise((resolve) => submit({ ...msg, resolve })).then(sendResponse);
  return true;
});
