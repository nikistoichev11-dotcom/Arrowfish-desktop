// Relays analysis requests from the content script to the offscreen document that hosts Stockfish.
let creating = null;
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  if (!creating) {
    creating = chrome.offscreen
      .createDocument({ url: 'offscreen.html', reasons: ['WORKERS'], justification: 'Run the Stockfish engine in a Web Worker' })
      .finally(() => { creating = null; });
  }
  await creating;
}
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== 'background') return;
  ensureOffscreen()
    .then(() => chrome.runtime.sendMessage({ ...msg, target: 'offscreen' }))
    .then(sendResponse)
    .catch(() => sendResponse(null));
  return true;
});
