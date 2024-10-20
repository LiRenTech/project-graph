/**
 * 一切能迭代的对象都可以被认为是 Tickable
 */
export interface Tickable {
  tick(): void;
}
