type StackItem<T> = {
  item: T;
  level: number;
};
/**
 * 单调栈
 * 单调递增
 */
export class MonoStack<T> {
  private stack: StackItem<T>[] = [];

  constructor() {
    this.stack = [];
  }

  // 长度属性
  get length(): number {
    return this.stack.length;
  }

  // 入栈操作
  push(item: T, level: number): void {
    const stackItem: StackItem<T> = { item, level };
    while (
      this.stack.length > 0 &&
      this.stack[this.stack.length - 1].level >= level
    ) {
      this.stack.pop(); // 弹出不满足单调性的元素
    }
    this.stack.push(stackItem);
  }

  // 出栈操作
  pop(): T | undefined {
    const stackItem = this.stack.pop();
    return stackItem ? stackItem.item : undefined;
  }

  // 获取栈顶元素
  peek(): T | undefined {
    const stackItem = this.stack[this.stack.length - 1];
    return stackItem ? stackItem.item : undefined;
  }

  /**
   * 不安全的获取栈顶元素
   * 如果栈为空，则会抛出异常
   */
  unsafePeek(): T {
    return this.stack[this.stack.length - 1].item;
  }

  // 获取从栈底到栈顶的元素数，第几个元素
  get(index: number): T | undefined {
    const stackItem = this.stack[index];
    return stackItem ? stackItem.item : undefined;
  }

  unsafeGet(index: number): T {
    return this.stack[index].item;
  }

  // 判断栈是否为空
  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
