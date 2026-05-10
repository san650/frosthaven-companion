// Canonical Frosthaven XP-per-level table (matches the printed character sheet).
// Index 0 is unused; LEVEL_XP[n] is the XP required to reach level n.

export const LEVEL_XP = [
  null,
  0,
  45,
  95,
  150,
  210,
  275,
  345,
  420,
  500,
];

export const MAX_LEVEL = 9;

// Highest level the character has earned given current xp.
export const levelFromXp = (xp) => {
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
    if (xp >= LEVEL_XP[lvl]) return lvl;
  }
  return 1;
};
