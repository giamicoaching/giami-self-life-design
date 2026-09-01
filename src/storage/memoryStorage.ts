import type { StorageAdapter } from './storage.ts'

export function createMemoryStorage(initial: Record<string, string> = {}): StorageAdapter {
  const map = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return map.get(key) ?? null
    },
    setItem(key, value) {
      map.set(key, value)
    },
    removeItem(key) {
      map.delete(key)
    },
  }
}
