// App entry. Picks a view based on state + hash route, re-renders on change,
// and wires keyboard shortcuts for undo/redo.

import { store } from './store.js';
import { renderSelect } from './views/select.js';
import { renderSheet } from './views/sheet.js';
import { renderRetired } from './views/retired.js';
import { renderPerks } from './views/perks.js';
import { mountSnow } from './snow.js';

const root = document.getElementById('view');

const route = () => {
  const hash = location.hash || '';
  if (hash.startsWith('#/retired')) return 'retired';
  if (hash.startsWith('#/perks')) return 'perks';
  if (hash.startsWith('#/select')) return 'select';
  return store.state.activeCharacter ? 'sheet' : 'select';
};

const render = () => {
  const r = route();
  const state = store.state;
  if (r === 'retired') return renderRetired(root, state);
  if (r === 'perks' && state.activeCharacter) return renderPerks(root, state);
  if (r === 'sheet' && state.activeCharacter) return renderSheet(root, state);
  return renderSelect(root, state);
};

const isEditableTarget = (e) => {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
};

const onKeyDown = (e) => {
  const meta = e.metaKey || e.ctrlKey;
  if (!meta) return;
  if (e.key === 'z' || e.key === 'Z') {
    // Allow native field-level undo for the focused input; only intercept
    // when focus is outside an editable target so global undo doesn't
    // clobber inline editing semantics.
    if (isEditableTarget(e)) return;
    e.preventDefault();
    if (e.shiftKey) store.redo();
    else store.undo();
  } else if (e.key === 'y' || e.key === 'Y') {
    if (isEditableTarget(e)) return;
    e.preventDefault();
    store.redo();
  }
};

const start = async () => {
  await store.ready;
  mountSnow();
  store.subscribe(render);
  window.addEventListener('hashchange', render);
  window.addEventListener('keydown', onKeyDown);
  render();
};

start();
