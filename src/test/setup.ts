/**
 * @file setup.ts
 * @description Vitest test environment initialization with typed localStorage mock.
 */

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  public clear(): void {
    this.store = {};
  }

  public getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  public setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  public removeItem(key: string): void {
    delete this.store[key];
  }

  public get length(): number {
    return Object.keys(this.store).length;
  }

  public key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Assign mock to globalThis
Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
});
