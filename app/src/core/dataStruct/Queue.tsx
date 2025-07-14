export class Queue<T> {
  protected items: T[] = [];

  // 入队操作
  enqueue(element: T): void {
    this.items.push(element);
  }

  // 出队操作
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.shift();
  }

  public get arrayList(): T[] {
    return this.items;
  }

  // 查看队首元素
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[0];
  }

  tail(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.items.length - 1];
  }

  clear(): void {
    this.items = [];
  }

  // 检查队列是否为空
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get length(): number {
    return this.items.length;
  }

  // 获取队列的长度
  size(): number {
    return this.items.length;
  }

  toString(): string {
    return this.items.toString();
  }
}
