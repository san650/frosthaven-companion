// Minimal IndexedDB wrapper. One object store ('state') keyed by string.
// We use a single document key 'app' so the entire app state is read/written
// as one blob. That keeps things simple for a single-character workflow.

const DB_NAME = 'frosthaven-companion';
const DB_VERSION = 1;
const STORE = 'state';
const DOC_KEY = 'app';

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

const tx = async (mode) => {
  const db = await openDb();
  const t = db.transaction(STORE, mode);
  return t.objectStore(STORE);
};

export const loadState = async () => {
  const store = await tx('readonly');
  return new Promise((resolve, reject) => {
    const req = store.get(DOC_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
};

export const saveState = async (state) => {
  const store = await tx('readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put(state, DOC_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// Ask the browser to mark storage as persistent so iOS / Safari is less
// likely to evict on storage pressure. Safe to call repeatedly.
export const requestPersistence = async () => {
  if (navigator.storage?.persist) {
    try {
      await navigator.storage.persist();
    } catch {}
  }
};
