// Short in-memory cache for public catalog reads: warm serverless instances skip database round-trips.
const store = new Map<string, { at: number; value: Promise<unknown> }>();
export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>;
  const value = load().catch(e => { store.delete(key); throw e; });
  store.set(key, { at: Date.now(), value });
  return value;
}
