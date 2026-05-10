// Active character sheet. All edits dispatch commands so they're undoable.
//
// Layout target: fits a single mobile viewport with no body scroll.
// - Topbar (class sigil, class name, retired link, undo/redo)
// - Parchment panel containing: name, level row, XP stepper, gold stepper, resources
// - Footer with Notes (opens drawer) + Retire buttons
// - Comments live in a slide-up drawer, not inline

import { getClass } from '../data/classes.js';
import { RESOURCES, getResource } from '../data/resources.js';
import { LEVEL_XP, MAX_LEVEL, levelFromXp } from '../data/xp-thresholds.js';
import { store } from '../store.js';
import { makeCommand } from '../commands.js';
import { el, svgEl } from '../dom.js';
import { openActionsDrawer } from './actions-drawer.js';

const goldResource = () => getResource('gold');
const nonGoldResources = () => RESOURCES.filter((r) => r.id !== 'gold');

/* ----------------------------- TOPBAR ------------------------------- */

const renderTopbar = (cls) => {
  const sigil = el('span', { class: 'sigil sigil--sm' });
  sigil.appendChild(svgEl(cls.iconSvg));

  const title = el('div', { class: 'topbar__title' },
    sigil,
    el('span', { class: 'topbar__class', text: cls.name }),
  );

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

  return el('header', { class: 'topbar' },
    title,
    el('div', { class: 'topbar__actions' }, undoBtn, redoBtn),
  );
};

/* --------------------------- NAME FIELD ----------------------------- */

const renderName = (character) => {
  const input = el('input', {
    type: 'text',
    class: 'name-input',
    placeholder: 'name your character',
    'aria-label': 'Character name',
    autocapitalize: 'words',
    autocomplete: 'off',
    spellcheck: 'false',
    'data-focus-key': 'name',
  });
  input.value = character.name;
  input.addEventListener('input', () => {
    store.dispatch(makeCommand('SET_NAME', {
      from: store.state.activeCharacter.name,
      to: input.value,
    }));
  });
  return el('section', { class: 'sheet-section' }, input);
};

/* ---------------------------- LEVEL ROW ----------------------------- */

const renderLevel = (character) => {
  const earned = levelFromXp(character.xp);
  const cells = [];
  for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
    const isActive = character.level === lvl;
    const isLocked = character.xp < LEVEL_XP[lvl];

    const classes = ['level-cell'];
    if (isActive) classes.push('level-cell--active');
    if (isLocked) classes.push('level-cell--locked');

    const cell = el('button', {
      type: 'button',
      class: classes.join(' '),
      'aria-label': `Level ${lvl}, requires ${LEVEL_XP[lvl]} XP${isLocked ? ' — locked' : ''}`,
      'aria-pressed': isActive ? 'true' : 'false',
      onClick: () => {
        if (isLocked) return;
        store.dispatch(makeCommand('SET_LEVEL', {
          from: store.state.activeCharacter.level,
          to: lvl,
        }));
      },
    },
      el('span', { class: 'level-cell__box', text: String(lvl) }),
      el('span', { class: 'level-cell__xp', text: String(LEVEL_XP[lvl]) }),
    );
    if (isLocked && !isActive) cell.disabled = true;
    cells.push(cell);
  }
  return el('section', { class: 'sheet-section' },
    el('div', { class: 'sheet-label', text: `Level — earned ${earned}` }),
    el('div', { class: 'level-track', role: 'radiogroup', 'aria-label': 'Level' }, ...cells),
  );
};

/* --------------------------- STAT STEPPER --------------------------- */

const STEP_DELTAS = [-10, -1, 1, 10];

const renderStat = ({ kind, label, value, iconSvg, onDelta }) => {
  const iconWrap = el('span', { class: 'stat-row__icon' });
  iconWrap.appendChild(svgEl(iconSvg));

  const buttons = STEP_DELTAS.map((delta) => {
    const sign = delta > 0 ? '+' : '−';
    const text = `${sign}${Math.abs(delta)}`;
    return el('button', {
      type: 'button',
      class: `stepper__btn${delta < 0 ? ' stepper__btn--neg' : ''}${Math.abs(delta) === 1 ? ' stepper__btn--minor' : ''}`,
      'aria-label': `${delta > 0 ? 'add' : 'subtract'} ${Math.abs(delta)}`,
      text,
      onClick: () => onDelta(delta),
    });
  });

  return el('section', { class: `sheet-section stat-row stat-row--${kind}` },
    el('div', { class: 'stat-row__head' },
      iconWrap,
      el('span', { class: 'stat-row__label', text: label }),
      el('span', { class: 'stat-row__value', text: String(value) }),
    ),
    el('div', { class: 'stepper' }, ...buttons),
  );
};

const renderXp = (character) => renderStat({
  kind: 'xp',
  label: 'Experience',
  value: character.xp,
  iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>',
  onDelta: (delta) => {
    const from = store.state.activeCharacter.xp;
    const to = Math.max(0, from + delta);
    store.dispatch(makeCommand('SET_XP', { from, to }));
  },
});

const renderGold = (character) => {
  const gold = goldResource();
  return renderStat({
    kind: 'gold',
    label: 'Gold',
    value: character.resources.gold ?? 0,
    iconSvg: gold.iconSvg,
    onDelta: (delta) => {
      const from = store.state.activeCharacter.resources.gold ?? 0;
      const to = Math.max(0, from + delta);
      store.dispatch(makeCommand('SET_RESOURCE', { id: 'gold', from, to }));
    },
  });
};

/* --------------------------- RESOURCES ------------------------------ */

const renderResource = (resource, value) => {
  const iconWrap = el('span', { class: 'resource__icon' });
  iconWrap.appendChild(svgEl(resource.iconSvg));

  const dec = el('button', {
    type: 'button',
    class: 'resource__btn resource__btn--neg',
    'aria-label': `decrease ${resource.name}`,
    text: '−',
    onClick: () => {
      const from = store.state.activeCharacter.resources[resource.id] ?? 0;
      const to = Math.max(0, from - 1);
      store.dispatch(makeCommand('SET_RESOURCE', { id: resource.id, from, to }));
    },
  });
  const inc = el('button', {
    type: 'button',
    class: 'resource__btn',
    'aria-label': `increase ${resource.name}`,
    text: '+',
    onClick: () => {
      const from = store.state.activeCharacter.resources[resource.id] ?? 0;
      store.dispatch(makeCommand('SET_RESOURCE', { id: resource.id, from, to: from + 1 }));
    },
  });

  return el('div', { class: 'resource' },
    iconWrap,
    el('span', { class: 'resource__name', text: resource.name }),
    el('span', { class: 'resource__value', text: String(value) }),
    el('div', { class: 'resource__btns' }, dec, inc),
  );
};

const renderResources = (character) => {
  const grid = el('div', { class: 'resources' },
    ...nonGoldResources().map((r) => renderResource(r, character.resources[r.id] ?? 0)),
  );
  return el('section', { class: 'sheet-section sheet-section--grow' },
    el('div', { class: 'sheet-label', text: 'Resources' }),
    grid,
  );
};

/* ----------------------------- FOOTER ------------------------------- */

const renderFooter = () => {
  const chevron = svgEl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 L 12 4 L 21 11"/></svg>');

  const tab = el('button', {
    type: 'button',
    class: 'actions-toggle',
    'aria-label': 'Show actions: notes, retired, retire',
    onClick: () => openActionsDrawer(),
  });
  tab.appendChild(chevron);

  return el('div', { class: 'foot' }, tab);
};

/* ----------------------------- ROOT --------------------------------- */

export const renderSheet = (root, state) => {
  const c = state.activeCharacter;
  if (!c) return;
  const cls = getClass(c.classId);

  // Preserve focus + caret across re-renders for the name field.
  const active = document.activeElement;
  const activeKey = active?.dataset?.focusKey;
  const selStart = active?.selectionStart;
  const selEnd = active?.selectionEnd;

  root.replaceChildren();

  const view = el('div', { class: 'view view--sheet' },
    renderTopbar(cls),
    el('div', { class: 'sheet-panel' },
      renderName(c),
      renderLevel(c),
      renderXp(c),
      renderGold(c),
      renderResources(c),
    ),
    renderFooter(),
  );

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
