// Active character sheet. All edits dispatch commands so they're undoable.

import { getClass } from '../data/classes.js';
import { RESOURCES } from '../data/resources.js';
import { store } from '../store.js';
import { makeCommand } from '../commands.js';
import { el, svgEl } from '../dom.js';

const MAX_LEVEL = 9;

const fieldRow = (label, control) =>
  el('div', { class: 'field' },
    el('label', { class: 'field__label', text: label }),
    control,
  );

const counter = ({ value, min = 0, onChange, ariaLabel }) => {
  const dec = el('button', {
    type: 'button',
    class: 'counter__btn',
    'aria-label': `decrease ${ariaLabel}`,
    text: '−',
    onClick: () => onChange(Math.max(min, value - 1)),
  });
  const inc = el('button', {
    type: 'button',
    class: 'counter__btn',
    'aria-label': `increase ${ariaLabel}`,
    text: '+',
    onClick: () => onChange(value + 1),
  });
  const display = el('span', { class: 'counter__value', text: String(value) });
  return el('div', { class: 'counter', role: 'group', 'aria-label': ariaLabel }, dec, display, inc);
};

const renderTopbar = (cls, retiredCount) => {
  const retiredLink = retiredCount > 0
    ? el('a', { href: '#/retired', class: 'topbar__link', text: `Retired (${retiredCount})` })
    : null;

  const undoBtn = el('button', {
    type: 'button',
    class: 'iconbtn',
    'aria-label': 'Undo',
    text: '↶',
    onClick: () => store.undo(),
  });
  undoBtn.disabled = !store.canUndo();

  const redoBtn = el('button', {
    type: 'button',
    class: 'iconbtn',
    'aria-label': 'Redo',
    text: '↷',
    onClick: () => store.redo(),
  });
  redoBtn.disabled = !store.canRedo();

  const title = el('div', { class: 'topbar__title' });
  const iconSpan = el('span', { class: 'topbar__icon' });
  iconSpan.appendChild(svgEl(cls.iconSvg));
  title.append(iconSpan, el('span', { text: cls.name }));

  return el('header', { class: 'topbar' },
    title,
    el('div', { class: 'topbar__actions' },
      retiredLink,
      undoBtn,
      redoBtn,
    ),
  );
};

const renderName = (character) => {
  const input = el('input', {
    type: 'text',
    class: 'input',
    placeholder: 'Name your character',
    'aria-label': 'Character name',
  });
  input.value = character.name;
  input.addEventListener('input', () => {
    store.dispatch(makeCommand('SET_NAME', { from: store.state.activeCharacter.name, to: input.value }));
  });
  return fieldRow('Name', input);
};

const renderLevel = (character) => {
  const ctl = counter({
    value: character.level,
    min: 1,
    ariaLabel: 'level',
    onChange: (to) => {
      const clamped = Math.min(MAX_LEVEL, Math.max(1, to));
      store.dispatch(makeCommand('SET_LEVEL', { from: store.state.activeCharacter.level, to: clamped }));
    },
  });
  return fieldRow('Level', ctl);
};

const renderXp = (character) => {
  const ctl = counter({
    value: character.xp,
    min: 0,
    ariaLabel: 'experience',
    onChange: (to) => {
      store.dispatch(makeCommand('SET_XP', { from: store.state.activeCharacter.xp, to }));
    },
  });
  return fieldRow('XP', ctl);
};

const renderResource = (resource, value) => {
  const iconEl = el('span', { class: 'resource__icon' });
  iconEl.appendChild(svgEl(resource.iconSvg));

  const ctl = counter({
    value,
    min: 0,
    ariaLabel: resource.name.toLowerCase(),
    onChange: (to) => {
      const from = store.state.activeCharacter.resources[resource.id];
      store.dispatch(makeCommand('SET_RESOURCE', { id: resource.id, from, to }));
    },
  });

  return el('div', { class: 'resource' },
    el('div', { class: 'resource__head' },
      iconEl,
      el('span', { class: 'resource__name', text: resource.name }),
    ),
    ctl,
  );
};

const renderResources = (character) => {
  const grid = el('div', { class: 'resources' },
    ...RESOURCES.map((r) => renderResource(r, character.resources[r.id] ?? 0)),
  );
  return el('section', { class: 'section' },
    el('h2', { class: 'section__title', text: 'Resources' }),
    grid,
  );
};

const renderComments = (character) => {
  const ta = el('textarea', {
    class: 'textarea',
    rows: '5',
    placeholder: 'Notes, perks, items, story...',
    'aria-label': 'Comments',
  });
  ta.value = character.comments;
  ta.addEventListener('input', () => {
    store.dispatch(makeCommand('SET_COMMENTS', { from: store.state.activeCharacter.comments, to: ta.value }));
  });
  return el('section', { class: 'section' },
    el('h2', { class: 'section__title', text: 'Comments' }),
    ta,
  );
};

const renderRetire = () => {
  const btn = el('button', {
    type: 'button',
    class: 'btn btn--danger',
    text: 'Retire Character',
    onClick: () => {
      const name = store.state.activeCharacter.name || 'this character';
      if (confirm(`Retire ${name}? They'll be archived and you can choose a new class.`)) {
        store.retireActive();
      }
    },
  });
  return el('section', { class: 'section section--actions' }, btn);
};

export const renderSheet = (root, state) => {
  const c = state.activeCharacter;
  if (!c) return;
  const cls = getClass(c.classId);

  // Preserve focus + caret across re-renders for text inputs.
  const active = document.activeElement;
  const activeKey = active?.dataset?.focusKey;
  const selStart = active?.selectionStart;
  const selEnd = active?.selectionEnd;

  root.replaceChildren();

  const view = el('div', { class: 'view view--sheet' },
    renderTopbar(cls, state.retired.length),
    el('section', { class: 'section' },
      renderName(c),
      renderLevel(c),
      renderXp(c),
    ),
    renderResources(c),
    renderComments(c),
    renderRetire(),
  );

  // Tag focusable text fields so we can restore focus after re-render.
  view.querySelector('input.input')?.setAttribute('data-focus-key', 'name');
  view.querySelector('textarea.textarea')?.setAttribute('data-focus-key', 'comments');

  root.appendChild(view);

  if (activeKey) {
    const next = view.querySelector(`[data-focus-key="${activeKey}"]`);
    if (next) {
      next.focus();
      if (selStart != null && next.setSelectionRange) {
        try { next.setSelectionRange(selStart, selEnd); } catch {}
      }
    }
  }
};
