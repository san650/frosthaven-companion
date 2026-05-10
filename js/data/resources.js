// Frosthaven resources. Order matches the in-game resource track.
// Gold is treated as a resource here for UI purposes.

const svg = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const RESOURCES = [
  {
    id: 'gold',
    name: 'Gold',
    iconSvg: svg('<circle cx="12" cy="12" r="8"/><path d="M9 9h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5M12 7v2M12 15v2"/>'),
  },
  {
    id: 'lumber',
    name: 'Lumber',
    iconSvg: svg('<rect x="3" y="9" width="18" height="6" rx="3"/><circle cx="6" cy="12" r="1.2"/><path d="M9 10c0 .8 0 3 0 4M12 10c0 .8 0 3 0 4M15 10c0 .8 0 3 0 4M18 10c0 .8 0 3 0 4"/>'),
  },
  {
    id: 'metal',
    name: 'Metal',
    iconSvg: svg('<path d="M5 14l3-6h8l3 6-3 4H8z"/><path d="M8 14h8"/>'),
  },
  {
    id: 'hide',
    name: 'Hide',
    iconSvg: svg('<path d="M7 5c-2 0-3 2-3 4s1 3 1 5-1 3-1 5h4c0-1 1-2 2-2h4c1 0 2 1 2 2h4c0-2-1-3-1-5s1-3 1-5-1-4-3-4c-1 0-2 1-3 2h-4c-1-1-2-2-3-2z"/>'),
  },
  {
    id: 'arrowvine',
    name: 'Arrowvine',
    iconSvg: svg('<path d="M5 19c4-2 6-6 8-10M11 9l3-3 3 3M14 6v6"/><path d="M9 13c-2 1-3 3-3 5"/>'),
  },
  {
    id: 'axenut',
    name: 'Axenut',
    iconSvg: svg('<ellipse cx="12" cy="13" rx="6" ry="7"/><path d="M12 6V3M9 6l-2-2M15 6l2-2"/><path d="M8 11c2 1 6 1 8 0"/>'),
  },
  {
    id: 'rockroot',
    name: 'Rockroot',
    iconSvg: svg('<path d="M5 11l3-4h8l3 4-3 4H8z"/><path d="M9 15v4M12 15v5M15 15v4M7 19h2M11 20h2M14 19h2"/>'),
  },
];

export const getResource = (id) => RESOURCES.find((r) => r.id === id);
