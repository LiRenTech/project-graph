/**
 * 一切具有销毁函数的类都应该实现此接口
 */
export interface Disposable {
  dispose(): void;
}

/**
 * 一切能迭代的对象都可以被认为是 Tickable
 */
export interface Tickable {
  logicTick(): void;
}

export interface Renderable {
  renderTick(): void;
}
