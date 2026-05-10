// Class selection view. Two grids: starters (3 cols), unlockables (4 cols).
// Decorative snowfall layer is added once and shared across views.

import { STARTER_CLASSES, UNLOCKABLE_CLASSES } from '../data/classes.js';
import { store } from '../store.js';
import { el, svgEl } from '../dom.js';

const classButton = (cls, index) => {
  const btn = el('button', {
    type: 'button',
    class: 'class-tile',
    dataset: { classId: cls.id },
    onClick: () => store.startCharacter(cls.id),
  });
  btn.style.setProperty('--i', String(index));

  const sigil = el('span', { class: 'sigil class-tile__sigil' });
  sigil.appendChild(svgEl(cls.iconSvg));

  btn.append(
    sigil,
    el('span', { class: 'class-tile__name', text: cls.name }),
  );
  return btn;
};

const renderGroup = (heading, classes, modifierClass, indexOffset) => {
  const grid = el('div', { class: `class-grid ${modifierClass}` });
  classes.forEach((cls, i) => grid.appendChild(classButton(cls, indexOffset + i)));
  return el('section', { class: 'class-group' },
    el('h2', { text: heading }),
    grid,
  );
};

const renderHero = (state) => {
  const hero = el('section', { class: 'select-hero' },
    el('h1', { text: 'Frosthaven' }),
    el('div', { class: 'rune' }, el('span', { text: 'Choose your destiny' })),
  );
  if (state.retired.length > 0) {
    const link = el('a', {
      href: '#/retired',
      class: 'topbar__link',
      text: `View Retired (${state.retired.length})`,
    });
    link.style.marginTop = '4px';
    hero.appendChild(link);
  }
  return hero;
};

export const renderSelect = (root, state) => {
  root.replaceChildren();

  const view = el('div', { class: 'view view--select' },
    renderHero(state),
    el('div', { class: 'select-scroll' },
      renderGroup('Starter Classes', STARTER_CLASSES, '', 0),
      renderGroup('Unlockable Classes', UNLOCKABLE_CLASSES, 'class-grid--unlocks', STARTER_CLASSES.length),
    ),
  );
  root.appendChild(view);
};
