/**
 * @file setup.ts
 * @description Vitest test environment initialization with localStorage mock.
 */

class LocalStorageMock {
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

// Assign to globalThis
(globalThis as any).localStorage = new LocalStorageMock();
