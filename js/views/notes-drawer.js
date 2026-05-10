// Slide-up bottom drawer for character notes/comments.
//
// Mounted once on first open and reused. Reads/writes go through the
// store's SET_COMMENTS command so they remain undoable.

import { store } from '../store.js';
import { makeCommand } from '../commands.js';
import { el } from '../dom.js';

let mount = null;
let textarea = null;

const sync = () => {
  if (!textarea) return;
  // Don't clobber the user's caret while they are typing.
  if (document.activeElement === textarea) return;
  const v = store.state.activeCharacter?.comments ?? '';
  if (textarea.value !== v) textarea.value = v;
};

const close = () => {
  if (!mount) return;
  mount.classList.remove('is-open');
  textarea?.blur();
  document.removeEventListener('keydown', onKey);
};

const onKey = (e) => {
  if (e.key === 'Escape') close();
};

const ensureMount = () => {
  if (mount) return mount;

  const handle = el('div', { class: 'drawer__handle', 'aria-hidden': 'true' });
  const title = el('div', { class: 'drawer__title', text: 'Notes' });
  const closeBtn = el('button', {
    type: 'button',
    class: 'drawer__close',
    'aria-label': 'Close notes',
    text: '×',
    onClick: () => close(),
  });
  const head = el('div', { class: 'drawer__head' }, title, closeBtn);

  textarea = el('textarea', {
    class: 'comments-area',
    placeholder: 'Notes, perks, items, story...',
    'aria-label': 'Character notes',
    'data-focus-key': 'notes',
    rows: '8',
  });
  textarea.addEventListener('input', () => {
    store.dispatch(makeCommand('SET_COMMENTS', {
      from: store.state.activeCharacter?.comments ?? '',
      to: textarea.value,
    }));
  });

  const sheet = el('div', {
    class: 'drawer__sheet',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Notes',
  }, handle, head, textarea);

  // Tap outside the sheet to close.
  mount = el('div', {
    class: 'drawer',
    onClick: (e) => { if (e.target === mount) close(); },
  }, sheet);

  document.body.appendChild(mount);
  store.subscribe(sync);
  return mount;
};

export const openNotesDrawer = () => {
  ensureMount();
  sync();
  mount.classList.add('is-open');
  document.addEventListener('keydown', onKey);
  // Defer focus until after the slide-up animation has started so iOS
  // doesn't mis-position the caret.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => textarea.focus());
  });
};

export const closeNotesDrawer = close;
