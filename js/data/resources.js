// Frosthaven resources. Order matches the in-game resource track:
// Lumber, Metal, Hide, Flame Fruit, Axenut, Rockroot, Arrowvine,
// Snowthistle, Tailleaf. Gold is treated separately for UI purposes
// but kept in this list so its icon and label live alongside the rest.

const svg = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

// Note on iconography: icons are stroke-only line-art (currentColor)
// rather than the full-color illustrations from Frosthaven. The shapes
// are chosen to match each resource's silhouette in the printed game:
//   gold        — coin with a serif G-shape
//   lumber      — log viewed from the end (concentric tree rings)
//   metal       — silver ingot (trapezoid wedge with depth line)
//   hide        — stretched pelt with four pegged corners
//   flame fruit — round fruit with a clear flame stem on top
//   axenut      — acorn (cap + body), the closest "nut" silhouette
//   rockroot    — chunk of stone with roots descending below
//   arrowvine   — vine with an arrowhead-shaped leaf
//   snowthistle — bulb with six radiating snowflake spikes
//   tailleaf    — long curling leaf with a central vein
// Refine these freely if you want closer game art matches.

export const RESOURCES = [
  {
    id: 'gold',
    name: 'Gold',
    iconSvg: svg('<circle cx="12" cy="12" r="8"/><path d="M9 9h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5M12 7v2M12 15v2"/>'),
  },
  {
    id: 'lumber',
    name: 'Lumber',
    iconSvg: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2.5"/>'),
  },
  {
    id: 'metal',
    name: 'Metal',
    iconSvg: svg('<path d="M3.5 16l3-7.5h11l3 7.5z"/><path d="M6.5 16h11"/>'),
  },
  {
    id: 'hide',
    name: 'Hide',
    iconSvg: svg('<path d="M6 5l2 2 4-1 4 1 2-2 1 3-2 2v6l2 2-1 3-2-2-4 1-4-1-2 2-1-3 2-2v-6l-2-2z"/>'),
  },
  {
    id: 'flame-fruit',
    name: 'Flame Fruit',
    iconSvg: svg('<path d="M12 21.5c-4 0-6.5-2.7-6.5-6 0-3 2-5 4-7 0.8 0.8 1.5 1.5 2.5 1.5s1.7-0.7 2.5-1.5c2 2 4 4 4 7 0 3.3-2.5 6-6.5 6z"/><path d="M10.5 6c0-2 0.5-3.5 1.5-4.5 1 1 1.5 2.5 1.5 4.5"/>'),
  },
  {
    id: 'axenut',
    name: 'Axenut',
    iconSvg: svg('<path d="M7 9c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5v1H7z"/><path d="M7 10c0 5.5 2.2 11 5 11s5-5.5 5-11"/><path d="M7 10h10"/><path d="M12 5.5V3"/>'),
  },
  {
    id: 'rockroot',
    name: 'Rockroot',
    iconSvg: svg('<path d="M5 11l2.5-4h9l2.5 4-2.5 4h-9z"/><path d="M9 15v4M12 15v5M15 15v4"/><path d="M8 19h2M11 20.5h2M14 19h2"/>'),
  },
  {
    id: 'arrowvine',
    name: 'Arrowvine',
    iconSvg: svg('<path d="M5 19c4-2 6-6 8-10"/><path d="M11 9l3-3 3 3M14 6v6"/><path d="M9 13c-2 1-3 3-3 5"/>'),
  },
  {
    id: 'snowthistle',
    name: 'Snowthistle',
    iconSvg: svg('<ellipse cx="12" cy="13" rx="3" ry="3.5"/><path d="M12 9.5V3M8.5 10.5L5.5 6M15.5 10.5L18.5 6M9 13.5H4.5M15 13.5h4.5"/><path d="M11 4l1-1 1 1M5.5 7l0.7-0.7L7 7M17 7l0.7-0.7L18.5 7M5 13.5l-0.7-0.7M19 13.5l0.7-0.7"/><path d="M12 17v4M9.5 21h5"/>'),
  },
  {
    id: 'tailleaf',
    name: 'Tailleaf',
    iconSvg: svg('<path d="M5 21c1-3 3-7 7-11 2-2 4-3 7-4-1 3-2 5-4 7-4 4-8 6-10 8z"/><path d="M6 19c3-3 8-8 13-12"/>'),
  },
];

export const getResource = (id) => RESOURCES.find((r) => r.id === id);
