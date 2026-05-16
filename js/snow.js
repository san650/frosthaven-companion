// Decorative snowfall — mounted once on <body> as a position-fixed
// layer so it fills the entire viewport (including under the iOS home
// indicator on installed PWAs). The translucent parchment panel lets
// snow drift visibly behind the page content.
// Pure CSS animation; flakes are positioned with deterministic
// pseudo-random offsets so the scene looks the same on every reload.

import { el } from './dom.js';

const FLAKES = 18;

export const mountSnow = () => {
  if (document.querySelector('.snow')) return;
  const snow = el('div', { class: 'snow', 'aria-hidden': 'true' });
  for (let i = 0; i < FLAKES; i++) {
    const left  = (i * 53)  % 100;
    const size  = 2 + (i * 7)  % 4;
    const dur   = 8 + (i * 3)  % 9;
    const delay = (i * 11) % 12;
    const drift = -20 + (i * 17) % 40;
    const flake = el('span', { class: 'snowflake' });
    flake.style.left = `${left}%`;
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.animationDuration = `${dur}s`;
    flake.style.animationDelay = `-${delay}s`;
    flake.style.setProperty('--drift', `${drift}px`);
    snow.appendChild(flake);
  }
  document.body.prepend(snow);
};
