// Keep recently opened pages in memory; clearing the cache also invalidates pending writes.
export function createResourceCache({ maxAge = 30000, maxEntries = 40, now = Date.now } = {}) {
  const entries = new Map();
  let generation = 0;

  return {
    get generation() {
      return generation;
    },
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      entries.delete(key);
      entries.set(key, entry);
      return { data: entry.data, fresh: now() - entry.savedAt < maxAge };
    },
    set(key, data, expectedGeneration = generation) {
      if (expectedGeneration !== generation) return;
      entries.delete(key);
      entries.set(key, { data, savedAt: now() });
      while (entries.size > maxEntries) entries.delete(entries.keys().next().value);
    },
    delete(key) {
      entries.delete(key);
    },
    clear() {
      generation += 1;
      entries.clear();
    },
  };
}
