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

export const PERK_COUNT = 18;

const emptyResources = () =>
  Object.fromEntries(RESOURCES.map((r) => [r.id, 0]));

const emptyPerks = () => Array(PERK_COUNT).fill(false);

const normalizePerks = (perks) => {
  const base = emptyPerks();
  if (!Array.isArray(perks)) return base;
  for (let i = 0; i < PERK_COUNT; i++) base[i] = Boolean(perks[i]);
  return base;
};

const newCharacter = (classId) => ({
  id: crypto.randomUUID(),
  classId,
  name: '',
  level: 1,
  xp: 0,
  resources: emptyResources(),
  perks: emptyPerks(),
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
      // Two on-disk shapes are tolerated:
      //   - legacy: the bare state object (activeCharacter + retired)
      //   - current: { state, history } so undo carries across sessions
      const isLegacy = 'activeCharacter' in persisted || 'retired' in persisted;
      const state = isLegacy ? persisted : persisted.state;
      const history = isLegacy ? null : persisted.history;

      if (state) {
        // Backfill any new resource IDs that didn't exist when the state
        // was last saved, so a schema bump doesn't crash the UI.
        if (state.activeCharacter) {
          state.activeCharacter.resources = {
            ...emptyResources(),
            ...state.activeCharacter.resources,
          };
          state.activeCharacter.perks = normalizePerks(state.activeCharacter.perks);
        }
        this.state = state;
      }
      if (history) this.history.hydrate(history);
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
      await saveState({
        state: this.state,
        history: this.history.serialize(),
      });
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

  // --- backup / restore ---

  // Returns a JSON-serialisable snapshot for "Export character" so the
  // user has a copy of their data outside browser storage (iOS evicts
  // IndexedDB on uninstalled PWAs after 7 days of inactivity).
  exportState() {
    return {
      appName: 'frosthaven-companion',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: this.state,
      history: this.history.serialize(),
    };
  }

  // Replaces the live state with the contents of an exported snapshot.
  // Tolerates the legacy bare-state shape and the current { state, history }
  // wrapper. History is cleared on import (the imported workflow shouldn't
  // bleed undo entries from another device).
  async importState(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Backup file is empty or malformed.');
    }
    const incoming = payload.state ?? payload;
    if (!incoming || typeof incoming !== 'object' ||
        (!('activeCharacter' in incoming) && !('retired' in incoming))) {
      throw new Error('File does not look like a Frosthaven backup.');
    }
    const next = {
      activeCharacter: incoming.activeCharacter ?? null,
      retired: Array.isArray(incoming.retired) ? incoming.retired : [],
    };
    if (next.activeCharacter) {
      next.activeCharacter.resources = {
        ...emptyResources(),
        ...next.activeCharacter.resources,
      };
      next.activeCharacter.perks = normalizePerks(next.activeCharacter.perks);
    }
    this.state = next;
    this.history.clear();
    await this.#persist();
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
