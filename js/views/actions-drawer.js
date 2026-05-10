// Bottom action drawer — slides up to reveal Notes / Retired / Retire.
//
// Tapping "Notes" closes this drawer and opens the notes drawer in
// sequence so the two sheets don't fight for the same screen real
// estate at the same time.

import { store } from '../store.js';
import { getClass } from '../data/classes.js';
import { el, svgEl } from '../dom.js';
import { openNotesDrawer } from './notes-drawer.js';

let mount = null;

const CLOSE_MS = 280;

const ICONS = {
  notes:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M16 4v3h3M8 11h8M8 15h8M8 19h5"/></svg>',
  perks:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.8 7.1 18.2l.9-5.5-4-3.9 5.5-.8z"/><path d="M9 12l2 2 4-4"/></svg>',
  retired: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 8z"/><path d="M9 8V5a3 3 0 0 1 6 0v3M10 13v4M14 13v4"/></svg>',
  export:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
  import:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 11l5 5 5-5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
  retire:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-9 9H5v-6z"/><path d="M13 5l6 6M5 21h14"/></svg>',
};

/* ----------------------------- backup helpers ---------------------- */

const slugify = (s) =>
  String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const exportFilename = () => {
  const c = store.state.activeCharacter;
  const cls = c ? getClass(c.classId)?.name : null;
  const slug = slugify(c?.name) || slugify(cls) || 'backup';
  const date = new Date().toISOString().slice(0, 10);
  return `frosthaven-${slug}-${date}.json`;
};

const downloadExport = () => {
  const data = store.exportState();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportFilename();
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// Picks a JSON file via a transient hidden <input>. Must be invoked
// synchronously from the user gesture so iOS Safari accepts it.
const pickJsonFile = () => new Promise((resolve, reject) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.style.position = 'fixed';
  input.style.opacity = '0';
  input.style.pointerEvents = 'none';
  input.style.left = '-9999px';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    input.remove();
    if (file) resolve(file);
    else reject(new Error('No file selected'));
  }, { once: true });
  document.body.appendChild(input);
  input.click();
});

const runImport = async () => {
  let file;
  try {
    file = await pickJsonFile();
  } catch {
    return;
  }
  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch {
    alert('That file is not valid JSON.');
    return;
  }
  const ok = confirm(
    'Replace the current character and retired list with the contents of this backup? '
    + 'This cannot be undone.'
  );
  if (!ok) return;
  try {
    await store.importState(payload);
  } catch (err) {
    alert(err.message || 'Could not import this backup.');
  }
};

const close = () => {
  if (!mount) return;
  mount.classList.remove('is-open');
  document.removeEventListener('keydown', onKey);
};

const onKey = (e) => {
  if (e.key === 'Escape') close();
};

const item = ({ icon, title, hint, danger, onActivate, href }) => {
  const iconWrap = el('span', { class: 'action-item__icon' });
  iconWrap.appendChild(svgEl(icon));

  const titleEl = el('span', { class: 'action-item__title', text: title });
  const hintEl  = hint ? el('span', { class: 'action-item__hint', text: hint }) : null;
  const labelCol = el('span', { class: 'action-item__label' }, titleEl, hintEl);
  const chevron = el('span', { class: 'action-item__chev', 'aria-hidden': 'true', text: '›' });

  const cls = `action-item${danger ? ' action-item--danger' : ''}`;
  const handler = (e) => {
    if (onActivate) onActivate(e);
  };

  if (href) {
    return el('a', { class: cls, href, onClick: handler }, iconWrap, labelCol, chevron);
  }
  return el('button', { type: 'button', class: cls, onClick: handler }, iconWrap, labelCol, chevron);
};

const buildSheet = () => {
  const state = store.state;
  const retiredCount = state.retired.length;
  const perks = state.activeCharacter?.perks ?? [];
  const earnedPerks = perks.filter(Boolean).length;

  const handle = el('div', { class: 'actions-drawer__handle', 'aria-hidden': 'true' });

  const head = el('div', { class: 'actions-drawer__head' },
    el('span', { class: 'actions-drawer__title', text: 'Actions' }),
    el('button', {
      type: 'button',
      class: 'actions-drawer__close',
      'aria-label': 'Close actions',
      text: '×',
      onClick: () => close(),
    }),
  );

  const notesItem = item({
    icon: ICONS.notes,
    title: 'Notes',
    hint: 'Open the journal',
    onActivate: () => {
      close();
      // Wait for the slide-down before sliding the notes sheet up,
      // so the two sheets never overlap mid-animation.
      setTimeout(() => openNotesDrawer(), CLOSE_MS);
    },
  });

  const perksItem = item({
    icon: ICONS.perks,
    title: `Perks (${earnedPerks})`,
    hint: 'Track earned perks',
    href: '#/perks',
    onActivate: () => close(),
  });

  const retiredItem = retiredCount > 0
    ? item({
        icon: ICONS.retired,
        title: `Retired (${retiredCount})`,
        hint: 'View archived characters',
        href: '#/retired',
        onActivate: () => close(),
      })
    : null;

  const exportItem = item({
    icon: ICONS.export,
    title: 'Export',
    hint: 'Download a backup file',
    onActivate: () => {
      // Trigger download synchronously inside the gesture, then close.
      downloadExport();
      close();
    },
  });

  const importItem = item({
    icon: ICONS.import,
    title: 'Import',
    hint: 'Restore from a backup file',
    onActivate: () => {
      // File picker must open inside the user gesture.
      runImport().finally(() => close());
    },
  });

  const retireItem = item({
    icon: ICONS.retire,
    title: 'Retire',
    hint: 'Archive this character',
    danger: true,
    onActivate: () => {
      close();
      setTimeout(() => {
        const name = store.state.activeCharacter?.name || 'this character';
        if (confirm(`Retire ${name}? They'll be archived and you can choose a new class.`)) {
          store.retireActive();
        }
      }, CLOSE_MS / 2);
    },
  });

  return el('div', {
    class: 'actions-drawer__sheet',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Actions',
  }, handle, head, notesItem, perksItem, retiredItem, exportItem, importItem, retireItem);
};

const ensureMount = () => {
  if (mount) return mount;
  mount = el('div', {
    class: 'actions-drawer',
    onClick: (e) => { if (e.target === mount) close(); },
  });
  document.body.appendChild(mount);
  return mount;
};

export const openActionsDrawer = () => {
  ensureMount();
  // Rebuild the sheet content each open so retired-count stays current
  // and the menu reflects the latest state without subscribing.
  mount.replaceChildren(buildSheet());
  // Force layout, then add open class so the transform animates.
  // eslint-disable-next-line no-unused-expressions
  mount.offsetHeight;
  mount.classList.add('is-open');
  document.addEventListener('keydown', onKey);
};

export const closeActionsDrawer = close;
