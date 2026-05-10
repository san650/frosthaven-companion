// Class selection view. Shown when there is no active character.
// Two groups: starter classes first, unlockables below.

import { STARTER_CLASSES, UNLOCKABLE_CLASSES } from '../data/classes.js';
import { store } from '../store.js';
import { svgEl } from '../dom.js';

const classButton = (cls) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'class-tile';
  btn.dataset.classId = cls.id;

  const iconWrap = document.createElement('span');
  iconWrap.className = 'class-tile__icon';
  iconWrap.appendChild(svgEl(cls.iconSvg));

  const nameEl = document.createElement('span');
  nameEl.className = 'class-tile__name';
  nameEl.textContent = cls.name;

  btn.append(iconWrap, nameEl);
  btn.addEventListener('click', () => store.startCharacter(cls.id));
  return btn;
};

const group = (heading, classes) => {
  const section = document.createElement('section');
  section.className = 'class-group';
  const h = document.createElement('h2');
  h.textContent = heading;
  section.appendChild(h);
  const grid = document.createElement('div');
  grid.className = 'class-grid';
  for (const cls of classes) grid.appendChild(classButton(cls));
  section.appendChild(grid);
  return section;
};

export const renderSelect = (root, state) => {
  root.replaceChildren();
  const view = document.createElement('div');
  view.className = 'view view--select';

  const header = document.createElement('header');
  header.className = 'topbar';
  const title = document.createElement('h1');
  title.textContent = 'Choose a Character';
  header.appendChild(title);

  if (state.retired.length > 0) {
    const link = document.createElement('a');
    link.href = '#/retired';
    link.className = 'topbar__link';
    link.textContent = `Retired (${state.retired.length})`;
    header.appendChild(link);
  }

  view.append(header, group('Starter Classes', STARTER_CLASSES), group('Unlockable Classes', UNLOCKABLE_CLASSES));
  root.appendChild(view);
};
