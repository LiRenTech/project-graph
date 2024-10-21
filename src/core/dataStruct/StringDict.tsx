/**
 * key: uuid
 * value: 可变类型
 */
export class StringDict<T> {
  private data: { [key: string]: T } = {};

  setById(key: string, value: T): void {
    this.data[key] = value;
  }

  getById(key: string): T | undefined {
    return this.data[key];
  }

  hasId(key: string): boolean {
    return key in this.data;
  }

  hasValue(value: T): boolean {
    return Object.values(this.data).includes(value);
  }

  deleteById(key: string): void {
    delete this.data[key];
  }

  deleteByIds(keys: string[]): void {
    keys.forEach((key) => {
      delete this.data[key];
    });
  }

  deleteValue(value: T): void {
    const key = Object.keys(this.data).find((k) => this.data[k] === value);
    if (key) {
      delete this.data[key];
    }
  }

  deleteValues(values: T[]): void {
    values.forEach((value) => {
      this.deleteValue(value);
    });
  }

  clear(): void {
    this.data = {};
  }

  idsToArray(): string[] {
    return Object.keys(this.data);
  }

  valuesToArray(): T[] {
    return Object.values(this.data);
  }

  changeAllValue(fn: (value: T) => T): void {
    Object.values(this.data).forEach((value, index) => {
      this.data[Object.keys(this.data)[index]] = fn(value);
    });
  }

  changeValueById(key: string, fn: (value: T) => T): void {
    this.data[key] = fn(this.data[key]);
  }
}
