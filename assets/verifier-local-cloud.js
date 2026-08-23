/* The Verifier · Local Browser Cloud · v1.0.0
   A device-local persistence layer built on IndexedDB with a localStorage fallback.
   No remote account, hidden server, tracking, or credential storage is involved. */
(() => {
  "use strict";

  const DB_NAME = "the-verifier-local-cloud";
  const DB_VERSION = 1;
  const STORES = Object.freeze({
    editions: "editions",
    preferences: "preferences",
    saved: "saved",
    sourceHealth: "sourceHealth"
  });
  const fallback = window.VerifierSafety?.safeStorage?.("verifier-local-cloud-fallback") || null;
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.editions)) {
          const store = db.createObjectStore(STORES.editions, { keyPath: "date" });
          store.createIndex("generatedAt", "generatedAt", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.preferences)) {
          db.createObjectStore(STORES.preferences, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(STORES.saved)) {
          const store = db.createObjectStore(STORES.saved, { keyPath: "id" });
          store.createIndex("savedAt", "savedAt", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.sourceHealth)) {
          db.createObjectStore(STORES.sourceHealth, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
    });
    return dbPromise;
  }

  async function withStore(storeName, mode, action) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let result;
        try { result = action(store, tx); }
        catch (error) { reject(error); return; }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
        tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
      });
    } catch (error) {
      if (!fallback) throw error;
      return actionFallback(storeName, mode, action);
    }
  }

  function fallbackKey(storeName) { return `store:${storeName}`; }
  function fallbackRead(storeName) {
    const data = fallback?.get(fallbackKey(storeName), []);
    return Array.isArray(data) ? data : [];
  }
  function fallbackWrite(storeName, rows) {
    fallback?.set(fallbackKey(storeName), rows);
  }
  function primaryKey(storeName, value) {
    if (storeName === STORES.editions) return value?.date;
    if (storeName === STORES.preferences) return value?.key;
    return value?.id;
  }
  function actionFallback(storeName, mode, action) {
    const rows = fallbackRead(storeName);
    const facade = {
      get(key) {
        const req = {};
        queueMicrotask(() => {
          req.result = rows.find(row => primaryKey(storeName, row) === key);
          req.onsuccess?.();
        });
        return req;
      },
      getAll() {
        const req = {};
        queueMicrotask(() => { req.result = rows.slice(); req.onsuccess?.(); });
        return req;
      },
      put(value) {
        const key = primaryKey(storeName, value);
        const index = rows.findIndex(row => primaryKey(storeName, row) === key);
        if (index >= 0) rows[index] = structuredClone(value); else rows.push(structuredClone(value));
        fallbackWrite(storeName, rows);
      },
      delete(key) {
        fallbackWrite(storeName, rows.filter(row => primaryKey(storeName, row) !== key));
      },
      clear() { fallbackWrite(storeName, []); }
    };
    return Promise.resolve(action(facade, null));
  }

  async function get(storeName, key) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      return fallbackRead(storeName).find(row => primaryKey(storeName, row) === key) ?? null;
    }
  }

  async function getAll(storeName) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      return fallbackRead(storeName);
    }
  }

  async function put(storeName, value) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).put(structuredClone(value));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      const rows = fallbackRead(storeName);
      const key = primaryKey(storeName, value);
      const index = rows.findIndex(row => primaryKey(storeName, row) === key);
      if (index >= 0) rows[index] = structuredClone(value); else rows.push(structuredClone(value));
      fallbackWrite(storeName, rows);
      return key;
    }
  }

  async function remove(storeName, key) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      fallbackWrite(storeName, fallbackRead(storeName).filter(row => primaryKey(storeName, row) !== key));
      return true;
    }
  }

  async function clear(storeName) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {
      fallbackWrite(storeName, []);
      return true;
    }
  }

  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function saveEdition(date, articles, metadata = {}) {
    return put(STORES.editions, {
      date,
      generatedAt: new Date().toISOString(),
      articles: Array.isArray(articles) ? articles.slice(0, 100) : [],
      metadata: metadata && typeof metadata === "object" ? metadata : {}
    });
  }

  async function getEdition(date) { return get(STORES.editions, date); }
  async function listEditions() {
    const editions = await getAll(STORES.editions);
    return editions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  async function setPreference(key, value) {
    return put(STORES.preferences, { key: String(key), value, updatedAt: new Date().toISOString() });
  }
  async function getPreference(key, fallbackValue = null) {
    const row = await get(STORES.preferences, String(key));
    return row ? row.value : fallbackValue;
  }

  async function saveStory(story) {
    const id = String(story?.id || `${story?.link || ""}::${story?.title || ""}`).slice(0, 700);
    if (!id) throw new Error("Story id required");
    return put(STORES.saved, { ...structuredClone(story), id, savedAt: new Date().toISOString() });
  }
  async function listSaved() {
    const rows = await getAll(STORES.saved);
    return rows.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  }

  async function recordSourceHealth(id, status) {
    return put(STORES.sourceHealth, {
      id: String(id),
      ...structuredClone(status || {}),
      checkedAt: new Date().toISOString()
    });
  }

  async function exportAll() {
    return {
      format: "the-verifier-local-cloud",
      version: 1,
      exportedAt: new Date().toISOString(),
      editions: await getAll(STORES.editions),
      preferences: await getAll(STORES.preferences),
      saved: await getAll(STORES.saved),
      sourceHealth: await getAll(STORES.sourceHealth)
    };
  }

  async function importAll(payload) {
    if (!payload || payload.format !== "the-verifier-local-cloud" || Number(payload.version) !== 1) {
      throw new Error("Unsupported Verifier Local Cloud backup");
    }
    const limits = { editions: 730, preferences: 250, saved: 2000, sourceHealth: 500 };
    for (const [name, storeName] of Object.entries(STORES)) {
      const rows = Array.isArray(payload[name]) ? payload[name].slice(0, limits[name] || 500) : [];
      for (const row of rows) await put(storeName, row);
    }
    return true;
  }

  window.VerifierLocalCloud = Object.freeze({
    version: "1.0.0",
    DB_NAME,
    STORES,
    openDB,
    get,
    getAll,
    put,
    remove,
    clear,
    todayKey,
    saveEdition,
    getEdition,
    listEditions,
    setPreference,
    getPreference,
    saveStory,
    listSaved,
    recordSourceHealth,
    exportAll,
    importAll
  });
})();
