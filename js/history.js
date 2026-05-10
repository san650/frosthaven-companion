// Undo/redo stack for the active character.
//
// Coalescing: rapid successive commands targeting the same field
// (e.g. typing into the name input) merge into one history entry so
// undo reverses the whole edit, not letter-by-letter.
//
// History is in-memory only — closing the app clears it. The character
// state itself is persisted to IndexedDB independently.

import { coalesceKeyOf } from './commands.js';

const COALESCE_WINDOW_MS = 700;
const MAX_ENTRIES = 200;

export class History {
  constructor() {
    this.past = [];
    this.future = [];
  }

  record(cmd) {
    const stamped = { ...cmd, t: Date.now() };
    const last = this.past[this.past.length - 1];
    if (
      last &&
      last.type === cmd.type &&
      coalesceKeyOf(last) === coalesceKeyOf(cmd) &&
      stamped.t - last.t < COALESCE_WINDOW_MS
    ) {
      this.past[this.past.length - 1] = {
        ...last,
        payload: { ...last.payload, to: cmd.payload.to },
        t: stamped.t,
      };
    } else {
      this.past.push(stamped);
      if (this.past.length > MAX_ENTRIES) this.past.shift();
    }
    this.future = [];
  }

  popUndo() {
    return this.past.pop() ?? null;
  }

  pushFuture(cmd) {
    this.future.push(cmd);
  }

  popRedo() {
    return this.future.pop() ?? null;
  }

  pushPast(cmd) {
    this.past.push(cmd);
  }

  clear() {
    this.past = [];
    this.future = [];
  }

  canUndo() {
    return this.past.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }
}
