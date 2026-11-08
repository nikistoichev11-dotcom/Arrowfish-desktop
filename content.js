(() => {
  const S = { on: true, depth: 14, lines: 1 };
  const LI = location.hostname.includes('lichess');
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];
  const LET = { pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k' };
  let svg = null, lines = [], seen = '', stable = 0, token = 0;

  const load = () => chrome.storage.sync.get(S, (v) => { Object.assign(S, v); seen = ''; });
  load(); chrome.storage.onChanged.addListener(load);
  addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'KeyA') chrome.storage.sync.set({ on: !S.on });
  });

  // square index: file + rank*8 (a1 = 0, h8 = 63)
  const sqOf = (x, y, size, flipped) => {
    const c = Math.round(x / size), r = Math.round(y / size);
    return flipped ? 7 - c + r * 8 : c + (7 - r) * 8;
  };

  function readLichess() {
    const b = document.querySelector('cg-board'); if (!b) return null;
    const rect = b.getBoundingClientRect(), size = rect.width / 8; if (!size) return null;
    const flipped = !!document.querySelector('.cg-wrap.orientation-black');
    const pos = {}, hl = [];
    const tr = (el) => {
      const m = /translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px/.exec(el.style.transform || '');
      return m ? sqOf(+m[1], +m[2], size, flipped) : null;
    };
    b.querySelectorAll('piece').forEach((p) => {
      if (p.classList.contains('dragging') || p.classList.contains('ghost')) return;
      const cl = [...p.classList], s = tr(p);
      const white = cl.includes('white'), black = cl.includes('black');
      const t = cl.map((c) => LET[c]).find(Boolean);
      if (s !== null && (white || black) && t) pos[s] = white ? t.toUpperCase() : t;
    });
    b.querySelectorAll('square.last-move').forEach((q) => { const s = tr(q); if (s !== null) hl.push(s); });
    return { rect, flipped, pos, hl };
  }

  function readChessCom() {
    const b = document.querySelector('wc-chess-board, chess-board'); if (!b) return null;
    const rect = b.getBoundingClientRect(); if (!rect.width) return null;
    const flipped = b.classList.contains('flipped');
    const pos = {}, hl = [];
    const sq = (el) => { const m = /square-(\d)(\d)/.exec(el.className); return m ? +m[1] - 1 + (+m[2] - 1) * 8 : null; };
    b.querySelectorAll('.piece').forEach((p) => {
      const m = /\b([wb])([pnbrqk])\b/.exec(p.className), s = sq(p);
      if (m && s !== null) pos[s] = m[1] === 'w' ? m[2].toUpperCase() : m[2];
    });
    b.querySelectorAll('.highlight').forEach((h) => { const s = sq(h); if (s !== null) hl.push(s); });
    return { rect, flipped, pos, hl };
  }

  function toFen(r) {
    let f = '';
    for (let rk = 7; rk >= 0; rk--) {
      let e = 0;
      for (let fl = 0; fl < 8; fl++) {
        const p = r.pos[fl + rk * 8];
        if (p) { if (e) f += e; e = 0; f += p; } else e++;
      }
      if (e) f += e;
      if (rk) f += '/';
    }
    // the side that just moved owns the piece standing on a highlighted (last-move) square
    const mover = r.hl.map((s) => r.pos[s]).find(Boolean);
    const turn = mover ? (mover === mover.toUpperCase() ? 'b' : 'w') : 'w';
    const P = r.pos; let c = '';
    if (P[4] === 'K' && P[7] === 'R') c += 'K';
    if (P[4] === 'K' && P[0] === 'R') c += 'Q';
    if (P[60] === 'k' && P[63] === 'r') c += 'k';
    if (P[60] === 'k' && P[56] === 'r') c += 'q';
    return `${f} ${turn} ${c || '-'} - 0 1`;
  }

  function ensureSvg() {
    if (svg) return svg;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 8 8');
    svg.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647';
    document.documentElement.appendChild(svg);
    return svg;
  }
  const clear = () => { if (svg) svg.replaceChildren(); };

  function render(r) {
    const s = ensureSvg();
    Object.assign(s.style, { left: r.rect.left + 'px', top: r.rect.top + 'px', width: r.rect.width + 'px', height: r.rect.height + 'px' });
    s.replaceChildren();
    const ctr = (u, i) => {
      const f = u.charCodeAt(i) - 97, rk = +u[i + 1] - 1;
      return [(r.flipped ? 7 - f : f) + 0.5, (r.flipped ? rk : 7 - rk) + 0.5];
    };
    lines.forEach((u, i) => {
      if (!u || u.length < 4) return;
      const [x1, y1] = ctr(u, 0), [x2, y2] = ctr(u, 2);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      const w = i ? 0.1 : 0.15, hb = 0.32, bx = x2 - ux * hb, by = y2 - uy * hb, col = COLORS[i] || COLORS[2];
      const g = document.createElementNS(s.namespaceURI, 'g');
      g.setAttribute('opacity', i ? '0.6' : '0.85');
      g.innerHTML =
        `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
        `<polygon points="${x2 - ux * 0.05},${y2 - uy * 0.05} ${bx - uy * 0.2},${by + ux * 0.2} ${bx + uy * 0.2},${by - ux * 0.2}" fill="${col}"/>`;
      s.appendChild(g);
    });
  }

  function request(fen) {
    const id = ++token;
    try {
      chrome.runtime.sendMessage({ target: 'background', type: 'analyze', fen, depth: S.depth, lines: S.lines, id }, (res) => {
        if (chrome.runtime.lastError || !res || res.id !== token) return;
        lines = res.lines.map((l) => l.pv);
      });
    } catch (_) { /* extension was reloaded; page refresh needed */ }
  }

  setInterval(() => {
    const r = S.on ? (LI ? readLichess() : readChessCom()) : null;
    if (!r || Object.keys(r.pos).length < 2) { lines = []; seen = ''; clear(); return; }
    const fen = toFen(r);
    if (fen !== seen) { seen = fen; stable = 0; lines = []; token++; }
    else if (++stable === 1) request(fen); // only analyse once the position is stable for one tick
    render(r);
  }, 250);
})();
