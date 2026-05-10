// Activity log — a chronological ledger of recently committed commands.
// Each entry reads like a line in an old account book: timestamp on the
// left, action label, dotted leader, then the value (with from → to
// visible for numeric changes). Newest at the top.

import { getClass } from '../data/classes.js';
import { getResource } from '../data/resources.js';
import { store } from '../store.js';
import { el, svgEl } from '../dom.js';

const describe = (cmd) => {
  const p = cmd.payload;
  switch (cmd.type) {
    case 'SET_NAME':
      return { label: 'Name', kind: 'text', to: p.to || '∅', quoted: true };
    case 'SET_LEVEL':
      return { label: 'Level', kind: 'number', from: String(p.from), to: String(p.to) };
    case 'SET_XP':
      return { label: 'XP', kind: 'number', from: String(p.from), to: String(p.to) };
    case 'SET_RESOURCE': {
      const res = getResource(p.id);
      return {
        label: res?.name ?? p.id,
        kind: 'number',
        from: String(p.from),
        to: String(p.to),
      };
    }
    case 'SET_COMMENTS':
      return { label: 'Notes', kind: 'text', to: 'edited' };
    case 'SET_PERK':
      return {
        label: `Perk ${p.index + 1}`,
        kind: 'flag',
        to: p.to ? 'marked' : 'unmarked',
        on: !!p.to,
      };
    default:
      return { label: cmd.type, kind: 'text', to: '' };
  }
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const formatTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 30_000) return 'now';
  if (diff < HOUR)   return `${Math.max(1, Math.floor(diff / MINUTE))}m`;
  if (diff < DAY)    return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK)   return `${Math.floor(diff / DAY)}d`;
  if (diff < 30 * DAY) return `${Math.floor(diff / WEEK)}w`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const renderValue = (desc) => {
  if (desc.kind === 'number') {
    return el('span', { class: 'log-entry__value log-entry__value--num' },
      el('span', { class: 'log-entry__from', text: desc.from }),
      el('span', { class: 'log-entry__arrow', 'aria-hidden': 'true', text: '→' }),
      el('span', { class: 'log-entry__to', text: desc.to }),
    );
  }
  if (desc.kind === 'flag') {
    const mod = desc.on ? ' log-entry__value--on' : ' log-entry__value--off';
    return el('span', { class: `log-entry__value log-entry__value--flag${mod}`, text: desc.to });
  }
  // text
  const shown = desc.quoted ? `“${desc.to}”` : desc.to;
  return el('span', { class: 'log-entry__value log-entry__value--text', text: shown });
};

const ariaLabel = (desc, timeText) => {
  const when = `at ${timeText}`;
  switch (desc.kind) {
    case 'number': return `${desc.label} from ${desc.from} to ${desc.to} ${when}`;
    case 'flag':   return `${desc.label} ${desc.to} ${when}`;
    default:       return `${desc.label} ${desc.to} ${when}`;
  }
};

const renderEntry = (cmd) => {
  const desc = describe(cmd);
  const timeText = formatTime(cmd.t);
  return el('div', {
    class: 'log-entry',
    role: 'listitem',
    'aria-label': ariaLabel(desc, timeText),
  },
    el('span', { class: 'log-entry__time', text: timeText }),
    el('span', { class: 'log-entry__label', text: desc.label }),
    el('span', { class: 'log-entry__leader', 'aria-hidden': 'true' }),
    renderValue(desc),
  );
};

const renderTopbar = (cls) => {
  const back = el('a', { href: '#/', class: 'topbar__link', text: '← Back' });

  const sigil = el('span', { class: 'sigil sigil--sm' });
  if (cls) sigil.appendChild(svgEl(cls.iconSvg));

  const title = el('div', { class: 'topbar__title' },
    sigil,
    el('span', { class: 'topbar__class', text: 'Activity Log' }),
  );

  return el('header', { class: 'topbar' }, back, title);
};

export const renderLog = (root, state) => {
  root.replaceChildren();
  const cls = state.activeCharacter ? getClass(state.activeCharacter.classId) : null;
  // Render newest-first without mutating the underlying past array.
  const entries = store.history.past.slice().reverse();

  const list = el('div', { class: 'log-list', role: 'list' });
  if (entries.length === 0) {
    list.appendChild(el('p', { class: 'log-empty', text: 'No recorded actions yet.' }));
  } else {
    for (const cmd of entries) list.appendChild(renderEntry(cmd));
  }

  const count = entries.length;
  const heading = count === 1 ? '1 action' : `${count} actions`;

  const view = el('div', { class: 'view view--log' },
    renderTopbar(cls),
    el('div', { class: 'sheet-panel log-panel' },
      el('div', { class: 'sheet-label log-panel__title', text: `Activity Log · ${heading}` }),
      list,
    ),
  );

  root.appendChild(view);
};
