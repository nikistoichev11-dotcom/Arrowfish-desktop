# Arrowfish Desktop - Manual

## Requirements
- Google Chrome / Chromium-based browser, version 116 or newer (Edge, Brave work too)
- Node.js 18+ (only for the one-time engine download)

## Install
1. Download or clone this folder.
2. In the folder run `node scripts/setup.mjs`. This puts `stockfish.js` and `stockfish.wasm` into `engine/`.
3. Open `chrome://extensions`, switch on **Developer mode** (top right).
4. Click **Load unpacked** and select the `Arrowfish-desktop` folder.
5. Pin the extension (puzzle icon -> pin) for quick access.

### Manual engine install (if the script fails)
Download a single-thread WASM build of Stockfish.js, copy the `.js` file to `engine/stockfish.js` and the matching `.wasm` to `engine/stockfish.wasm` (the `.wasm` must have the same name as the `.js`).

## Use
1. Open a game or analysis board on Lichess or Chess.com.
2. Arrows appear after the position has been still for a moment.
3. Click the toolbar icon to change settings:
   - **Show arrows** - on/off (hotkey **Alt+A**)
   - **Depth** - higher is stronger but slower (14 is a good default)
   - **Lines** - 1 to 3 candidate moves
4. Arrows are drawn for the side whose turn it is.

## Troubleshooting
- **No arrows:** confirm `engine/stockfish.js` and `engine/stockfish.wasm` exist; reload the extension at `chrome://extensions`, then refresh the chess page.
- **Check the engine:** on `chrome://extensions` click **Details -> Inspect views** (service worker / offscreen) and look at the console.
- **Wrong side's move shown:** the turn is inferred from the last-move highlight; on a fresh board with no move yet White is assumed.
- **Castling rights / en passant** are not visible on the board, so castling rights are guessed from king/rook positions and en passant is ignored.
- **Site redesigns** can break board reading - open an issue.
- Extension updated or reloaded? Refresh open chess tabs.

## Fair play
Use for analysis, bots and reviewing your games. Do not use during games against other people.

## Uninstall
Remove it on `chrome://extensions`.
