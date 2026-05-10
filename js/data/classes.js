// Frosthaven character classes.
// Names of unlockables are publicly known; rename freely if you prefer
// to keep them obscured. iconSvg is a placeholder symbol — the
// frontend-design pass will replace these with refined glyphs.

const svg = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const STARTER_CLASSES = [
  {
    id: 'drifter',
    name: 'Drifter',
    iconSvg: svg('<path d="M5 4h14M5 20h14M7 4l5 8-5 8M17 4l-5 8 5 8"/>'),
  },
  {
    id: 'banner-spear',
    name: 'Banner Spear',
    iconSvg: svg('<path d="M7 3v18M7 4h10l-3 3 3 3H7"/>'),
  },
  {
    id: 'blink-blade',
    name: 'Blink Blade',
    iconSvg: svg('<path d="M13 3 5 13h6l-2 8 8-10h-6z"/>'),
  },
  {
    id: 'boneshaper',
    name: 'Boneshaper',
    iconSvg: svg('<path d="M12 3a7 7 0 0 0-7 7v3l2 2v3h2v2h6v-2h2v-3l2-2v-3a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="11" r="1.2"/><circle cx="14.5" cy="11" r="1.2"/><path d="M11 15h2"/>'),
  },
  {
    id: 'deathwalker',
    name: 'Deathwalker',
    iconSvg: svg('<path d="M12 3c-3 0-5 3-5 6 0 2 1 4 1 6 0 3-2 4-2 6h12c0-2-2-3-2-6 0-2 1-4 1-6 0-3-2-6-5-6z"/><path d="M10 11h4"/>'),
  },
  {
    id: 'geminate',
    name: 'Geminate',
    iconSvg: svg('<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/>'),
  },
];

export const UNLOCKABLE_CLASSES = [
  {
    id: 'bombard',
    name: 'Bombard',
    iconSvg: svg('<rect x="3" y="11" width="13" height="6" rx="1"/><circle cx="19" cy="14" r="2.5"/><path d="M5 17v3M14 17v3"/>'),
  },
  {
    id: 'crashing-tide',
    name: 'Crashing Tide',
    iconSvg: svg('<path d="M12 3v18M7 6l5 3 5-3M9 9v3M15 9v3M12 9v3"/>'),
  },
  {
    id: 'frozen-fist',
    name: 'Frozen Fist',
    iconSvg: svg('<path d="M7 10v8a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-5"/><path d="M7 10V7a2 2 0 0 1 4 0v3M11 10V6a2 2 0 0 1 4 0v4M15 10V8a2 2 0 0 1 4 0v5"/><path d="M3 5l3 3M6 5l-3 3"/>'),
  },
  {
    id: 'hive',
    name: 'Hive',
    iconSvg: svg('<path d="M12 3l4 2.3v4.7L12 12 8 9.9V5.3zM5 13l4 2.3V20l-4 2.3L1 20v-4.7zM19 13l4 2.3V20l-4 2.3L15 20v-4.7z" transform="translate(0 -1)"/>'),
  },
  {
    id: 'infuser',
    name: 'Infuser',
    iconSvg: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'),
  },
  {
    id: 'meteor',
    name: 'Meteor',
    iconSvg: svg('<circle cx="16" cy="8" r="4"/><path d="M3 21l9-9M5 21l5-5M3 19l5-5"/>'),
  },
  {
    id: 'pain-conduit',
    name: 'Pain Conduit',
    iconSvg: svg('<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M9 12l2 2 4-4"/>'),
  },
  {
    id: 'shattersong',
    name: 'Shattersong',
    iconSvg: svg('<path d="M9 18a2.5 2.5 0 1 1-2.5-2.5"/><path d="M9 18V6l8-2v9"/><path d="M19 15a2.5 2.5 0 1 1-2.5-2.5"/><path d="M14 9l-2 2M16 7l-2 2"/>'),
  },
  {
    id: 'snowdancer',
    name: 'Snowdancer',
    iconSvg: svg('<path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2M4 9l2 3-2 3M20 9l-2 3 2 3"/>'),
  },
  {
    id: 'trap',
    name: 'Trap',
    iconSvg: svg('<circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>'),
  },
  {
    id: 'coral',
    name: 'Coral',
    iconSvg: svg('<path d="M12 21V8M8 21V11M16 21V11M12 8c0-3 2-5 4-5M12 8c0-3-2-5-4-5M8 11c-1.5 0-3-1-3-3M16 11c1.5 0 3-1 3-3"/>'),
  },
];

export const ALL_CLASSES = [...STARTER_CLASSES, ...UNLOCKABLE_CLASSES];

export const getClass = (id) => ALL_CLASSES.find((c) => c.id === id);
