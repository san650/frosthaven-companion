// Read-only list of retired characters. Header is fixed, the list scrolls
// inside its own container so the body itself never scrolls.

import { getClass } from '../data/classes.js';
import { RESOURCES } from '../data/resources.js';
import { el, svgEl } from '../dom.js';

const formatDate = (ts) => new Date(ts).toLocaleDateString();

const retiredCard = (character) => {
  const cls = getClass(character.classId);
  const sigil = el('span', { class: 'sigil retired__sigil' });
  if (cls) sigil.appendChild(svgEl(cls.iconSvg));

  const name = character.name || '(unnamed)';
  const className = cls?.name ?? character.classId;

  const resourceLines = RESOURCES
    .filter((r) => (character.resources?.[r.id] ?? 0) > 0)
    .map((r) => `${r.name}: ${character.resources[r.id]}`)
    .join(' · ');

  const card = el('article', { class: 'retired' },
    el('span', { class: 'retired__stamp', text: 'Retired' }),
    el('div', { class: 'retired__head' },
      sigil,
      el('div', { class: 'retired__title' },
        el('div', { class: 'retired__name', text: name }),
        el('div', { class: 'retired__sub', text: `${className} · Lvl ${character.level} · ${character.xp} XP · ${formatDate(character.retiredAt)}` }),
      ),
    ),
  );

  if (resourceLines) {
    card.appendChild(el('div', { class: 'retired__resources', text: resourceLines }));
  }
  if (character.comments) {
    card.appendChild(el('p', { class: 'retired__comments', text: character.comments }));
  }
  return card;
};

export const renderRetired = (root, state) => {
  root.replaceChildren();

  const back = el('a', { href: '#/', class: 'topbar__link', text: '← Back' });
  const title = el('h1', { text: 'Retired' });
  const header = el('header', { class: 'topbar' }, back, title);

  const view = el('div', { class: 'view view--retired' }, header);

  const list = el('div', { class: 'retired-scroll' });
  if (state.retired.length === 0) {
    list.appendChild(el('p', { class: 'empty', text: 'No retired characters yet.' }));
  } else {
    for (const c of state.retired) list.appendChild(retiredCard(c));
  }
  view.appendChild(list);

  root.appendChild(view);
};
