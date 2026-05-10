// Lightweight toast for transient feedback (undo / redo messages).
// One shared DOM element mounted on first use; subsequent calls cancel
// the prior hide timer so rapid undos chain smoothly.

import { el } from './dom.js';
import { getResource } from './data/resources.js';

const HIDE_AFTER_MS = 2200;

let mount = null;
let hideTimer = 0;

const ensureMount = () => {
  if (mount) return mount;
  mount = el('div', {
    class: 'toast',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });
  document.body.appendChild(mount);
  return mount;
};

export const showToast = ({ prefix, message }) => {
  ensureMount();
  mount.replaceChildren();
  if (prefix) {
    mount.appendChild(el('span', { class: 'toast__prefix', text: prefix }));
  }
  mount.appendChild(el('span', { class: 'toast__msg', text: message }));
  // Force reflow so re-adding the visible class always re-triggers the
  // slide-up transition even when toasts replace each other.
  mount.classList.remove('is-visible');
  // eslint-disable-next-line no-unused-expressions
  mount.offsetHeight;
  mount.classList.add('is-visible');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    mount?.classList.remove('is-visible');
  }, HIDE_AFTER_MS);
};

const describe = (cmd, valueAfterAction) => {
  const p = cmd.payload;
  switch (cmd.type) {
    case 'SET_NAME':
      return `Name → "${valueAfterAction || '(empty)'}"`;
    case 'SET_LEVEL':
      return `Level → ${valueAfterAction}`;
    case 'SET_XP':
      return `XP → ${valueAfterAction}`;
    case 'SET_RESOURCE': {
      const res = getResource(p.id);
      const name = res?.name ?? p.id;
      return `${name} → ${valueAfterAction}`;
    }
    case 'SET_COMMENTS':
      return 'Notes updated';
    case 'SET_PERK':
      return `Perk ${p.index + 1} ${valueAfterAction ? 'marked' : 'unmarked'}`;
    default:
      return cmd.type;
  }
};

export const notifyUndo = (cmd) => {
  if (!cmd) return;
  showToast({ prefix: 'Undid', message: describe(cmd, cmd.payload.from) });
};

export const notifyRedo = (cmd) => {
  if (!cmd) return;
  showToast({ prefix: 'Redid', message: describe(cmd, cmd.payload.to) });
};
