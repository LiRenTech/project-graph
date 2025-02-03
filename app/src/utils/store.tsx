import { load, Store } from "@tauri-apps/plugin-store";
import { isWeb } from "./platform";

export async function createStore(name: string): Promise<Store> {
  if (isWeb) {
    return new WebStore(name) as unknown as Store;
  } else {
    return load(name);
  }
}

class WebStore {
  rid = 114514;
  constructor(private name: string) {}

  async clear() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        localStorage.removeItem(key);
      }
    }
  }
  async close() {}
  async delete(key: string) {
    localStorage.removeItem(`${this.name}_${key}`);
    return true;
  }
  async entries<T>() {
    const result: [string, T][] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        const value = localStorage.getItem(key);
        if (value) {
          result.push([key.slice(this.name.length + 1), JSON.parse(value)]);
        }
      }
    }
    return result;
  }
  async get<T>(key: string) {
    const value = localStorage.getItem(`${this.name}_${key}`);
    if (value) {
      return JSON.parse(value) as T;
    }
    return undefined;
  }
  async has(key: string) {
    return localStorage.getItem(`${this.name}_${key}`) !== null;
  }
  async keys() {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        result.push(key.slice(this.name.length + 1));
      }
    }
    return result;
  }
  async length() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        count++;
      }
    }
    return count;
  }
  async onChange() {
    return () => {};
  }
  async onKeyChange() {
    return () => {};
  }
  async reload() {}
  async reset() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        localStorage.removeItem(key);
      }
    }
  }
  async save() {}
  async set(key: string, value: any) {
    localStorage.setItem(`${this.name}_${key}`, JSON.stringify(value));
  }
  async values<T>() {
    const result: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.name}_`)) {
        const value = localStorage.getItem(key);
        if (value) {
          result.push(JSON.parse(value));
        }
      }
    }
    return result;
  }
}
