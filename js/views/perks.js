// Perks page. 18 checkboxes total, arranged as six groups of three in
// a 3-column × 2-row layout. Toggles dispatch SET_PERK so they're
// undoable like every other edit.

import { getClass } from '../data/classes.js';
import { store, PERK_COUNT } from '../store.js';
import { makeCommand } from '../commands.js';
import { el, svgEl } from '../dom.js';

const PERKS_PER_GROUP = 3;

const renderTopbar = (cls) => {
  const back = el('a', { href: '#/', class: 'topbar__link', text: '← Back' });

  const sigil = el('span', { class: 'sigil sigil--sm' });
  if (cls) sigil.appendChild(svgEl(cls.iconSvg));

  const title = el('div', { class: 'topbar__title' },
    sigil,
    el('span', { class: 'topbar__class', text: cls?.name ?? 'Perks' }),
  );

  return el('header', { class: 'topbar' }, back, title);
};

const renderPerkBox = (index, checked) => {
  return el('button', {
    type: 'button',
    class: `perk-box${checked ? ' perk-box--checked' : ''}`,
    'aria-label': `Perk ${index + 1}${checked ? ', earned' : ''}`,
    'aria-pressed': checked ? 'true' : 'false',
    onClick: () => {
      const from = !!store.state.activeCharacter.perks?.[index];
      store.dispatch(makeCommand('SET_PERK', { index, from, to: !from }));
    },
  },
    el('span', { class: 'perk-box__mark', 'aria-hidden': 'true', text: '✓' }),
  );
};

const renderPerkGroup = (groupIndex, perks) => {
  const boxes = [];
  let checkedInGroup = 0;
  let cellsInGroup = 0;
  for (let i = 0; i < PERKS_PER_GROUP; i++) {
    const idx = groupIndex * PERKS_PER_GROUP + i;
    if (idx >= PERK_COUNT) break;
    const checked = !!perks[idx];
    if (checked) checkedInGroup++;
    cellsInGroup++;
    boxes.push(renderPerkBox(idx, checked));
  }
  const complete = cellsInGroup > 0 && checkedInGroup === cellsInGroup;
  const classes = `perk-group${complete ? ' perk-group--complete' : ''}`;
  return el('div', {
    class: classes,
    'aria-label': complete ? 'Ability earned' : undefined,
  }, ...boxes);
};

export const renderPerks = (root, state) => {
  const c = state.activeCharacter;
  if (!c) return;
  const cls = getClass(c.classId);
  const perks = Array.isArray(c.perks) ? c.perks : [];
  const earned = perks.filter(Boolean).length;

  root.replaceChildren();

  const grid = el('div', { class: 'perks-grid' });
  const groupCount = Math.ceil(PERK_COUNT / PERKS_PER_GROUP);
  for (let g = 0; g < groupCount; g++) {
    grid.appendChild(renderPerkGroup(g, perks));
  }

  const view = el('div', { class: 'view view--perks' },
    renderTopbar(cls),
    el('div', { class: 'sheet-panel perks-panel' },
      el('div', { class: 'sheet-label', text: `Perks — ${earned} / ${PERK_COUNT}` }),
      grid,
    ),
  );

  root.appendChild(view);
};
