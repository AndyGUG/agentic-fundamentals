import '@testing-library/jest-dom'

class LocalStorageMock {
  private store: Record<string, string> = {}
  getItem(key: string): string | null { return this.store[key] ?? null }
  setItem(key: string, value: string): void { this.store[key] = value }
  removeItem(key: string): void { delete this.store[key] }
  clear(): void { this.store = {} }
  get length(): number { return Object.keys(this.store).length }
  key(i: number): string | null { return Object.keys(this.store)[i] ?? null }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock(), writable: true })

