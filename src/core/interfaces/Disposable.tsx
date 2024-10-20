/**
 * 一切具有销毁函数的类都应该实现此接口
 */
export interface Disposable {
  dispose(): void;
}
