// Commands describe a single reversible mutation to the active character.
// Each command type has apply/revert and a coalesceKey used by the history
// stack to merge rapid edits to the same field into a single undo entry.

const setActive = (state, k, v) => {
  state.activeCharacter = { ...state.activeCharacter, [k]: v };
};

const setResource = (state, id, v) => {
  state.activeCharacter = {
    ...state.activeCharacter,
    resources: { ...state.activeCharacter.resources, [id]: v },
  };
};

const setPerk = (state, index, v) => {
  const current = Array.isArray(state.activeCharacter.perks)
    ? state.activeCharacter.perks
    : [];
  const next = current.slice();
  next[index] = v;
  state.activeCharacter = { ...state.activeCharacter, perks: next };
};

export const COMMANDS = {
  SET_NAME: {
    apply: (s, p) => setActive(s, 'name', p.to),
    revert: (s, p) => setActive(s, 'name', p.from),
    coalesceKey: () => 'name',
  },
  SET_LEVEL: {
    apply: (s, p) => setActive(s, 'level', p.to),
    revert: (s, p) => setActive(s, 'level', p.from),
    coalesceKey: () => 'level',
  },
  SET_XP: {
    apply: (s, p) => setActive(s, 'xp', p.to),
    revert: (s, p) => setActive(s, 'xp', p.from),
    coalesceKey: () => 'xp',
  },
  SET_RESOURCE: {
    apply: (s, p) => setResource(s, p.id, p.to),
    revert: (s, p) => setResource(s, p.id, p.from),
    coalesceKey: (p) => `resource:${p.id}`,
  },
  SET_COMMENTS: {
    apply: (s, p) => setActive(s, 'comments', p.to),
    revert: (s, p) => setActive(s, 'comments', p.from),
    coalesceKey: () => 'comments',
  },
  SET_PERK: {
    apply: (s, p) => setPerk(s, p.index, p.to),
    revert: (s, p) => setPerk(s, p.index, p.from),
    coalesceKey: (p) => `perk:${p.index}`,
  },
};

export const makeCommand = (type, payload) => ({ type, payload });

export const coalesceKeyOf = (cmd) =>
  `${cmd.type}:${COMMANDS[cmd.type].coalesceKey(cmd.payload)}`;

// True when the resulting command would be a no-op (from === to).
export const isNoOp = (cmd) => {
  const { from, to } = cmd.payload;
  return from === to;
};
