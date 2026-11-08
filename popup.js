const D = { on: true, depth: 14, lines: 1 }, $ = (i) => document.getElementById(i);
chrome.storage.sync.get(D, (v) => {
  $('on').checked = v.on; $('depth').value = v.depth; $('lines').value = v.lines;
  $('dv').textContent = v.depth; $('lv').textContent = v.lines;
});
const save = () => {
  $('dv').textContent = $('depth').value; $('lv').textContent = $('lines').value;
  chrome.storage.sync.set({ on: $('on').checked, depth: +$('depth').value, lines: +$('lines').value });
};
['on', 'depth', 'lines'].forEach((i) => $(i).addEventListener('input', save));
