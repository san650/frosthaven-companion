// Single source of truth for the app.
//
// State shape:
//   {
//     activeCharacter: null | {
//       id: string,           // uuid; lets us archive multiple of same class
//       classId: string,
//       name: string,
//       level: number,
//       xp: number,
//       resources: { [resourceId]: number },
//       comments: string,
//       createdAt: number,
//     },
//     retired: Array<active-character-shape & { retiredAt: number }>,
//   }
//
// All mutations to activeCharacter go through dispatch(command) so they
// land in the undo/redo history. Lifecycle actions (start a new character,
// retire) are not undoable — they clear the history.

import { COMMANDS, isNoOp } from './commands.js';
import { History } from './history.js';
import { loadState, saveState, requestPersistence } from './db.js';
import { RESOURCES } from './data/resources.js';

const emptyResources = () =>
  Object.fromEntries(RESOURCES.map((r) => [r.id, 0]));

const newCharacter = (classId) => ({
  id: crypto.randomUUID(),
  classId,
  name: '',
  level: 1,
  xp: 0,
  resources: emptyResources(),
  comments: '',
  createdAt: Date.now(),
});

const initialState = () => ({
  activeCharacter: null,
  retired: [],
});

class Store {
  constructor() {
    this.state = initialState();
    this.history = new History();
    this.listeners = new Set();
    this.ready = this.#hydrate();
  }

  async #hydrate() {
    const persisted = await loadState();
    if (persisted) {
      // Backfill any new resource IDs that didn't exist when the state
      // was last saved, so a schema bump doesn't crash the UI.
      if (persisted.activeCharacter) {
        persisted.activeCharacter.resources = {
          ...emptyResources(),
          ...persisted.activeCharacter.resources,
        };
      }
      this.state = persisted;
    }
    requestPersistence();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  #notify() {
    for (const fn of this.listeners) fn(this.state);
  }

  async #persist() {
    try {
      await saveState(this.state);
    } catch (err) {
      console.error('Failed to persist state', err);
    }
  }

  // --- character lifecycle (not undoable) ---

  startCharacter(classId) {
    this.state = {
      ...this.state,
      activeCharacter: newCharacter(classId),
    };
    this.history.clear();
    this.#persist();
    this.#notify();
  }

  retireActive() {
    if (!this.state.activeCharacter) return;
    const retiredAt = Date.now();
    this.state = {
      activeCharacter: null,
      retired: [
        { ...this.state.activeCharacter, retiredAt },
        ...this.state.retired,
      ],
    };
    this.history.clear();
    this.#persist();
    this.#notify();
  }

  // --- undoable mutations ---

  dispatch(cmd) {
    if (!this.state.activeCharacter) return;
    if (isNoOp(cmd)) return;
    const def = COMMANDS[cmd.type];
    if (!def) throw new Error(`Unknown command: ${cmd.type}`);
    const next = structuredClone(this.state);
    def.apply(next, cmd.payload);
    this.state = next;
    this.history.record(cmd);
    this.#persist();
    this.#notify();
  }

  undo() {
    const cmd = this.history.popUndo();
    if (!cmd) return;
    const def = COMMANDS[cmd.type];
    const next = structuredClone(this.state);
    def.revert(next, cmd.payload);
    this.state = next;
    this.history.pushFuture(cmd);
    this.#persist();
    this.#notify();
  }

  redo() {
    const cmd = this.history.popRedo();
    if (!cmd) return;
    const def = COMMANDS[cmd.type];
    const next = structuredClone(this.state);
    def.apply(next, cmd.payload);
    this.state = next;
    this.history.pushPast(cmd);
    this.#persist();
    this.#notify();
  }

  canUndo() {
    return this.history.canUndo();
  }

  canRedo() {
    return this.history.canRedo();
  }
}

export const store = new Store();
