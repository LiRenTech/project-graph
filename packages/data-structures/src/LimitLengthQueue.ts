import { Queue } from ".";

export class LimitLengthQueue<T> extends Queue<T> {
  constructor(private limitLength: number) {
    if (limitLength <= 0) {
      throw new Error("限制长度必须是正整数");
    }
    super();
  }
  // 入队操作
  enqueue(element: T): void {
    if (this.items.length === this.limitLength) {
      this.dequeue();
    }
    this.items.push(element);
  }

  /**
   * 获取多个队尾元素，如果长度不足则返回数组长度不足
   * @param multi
   */
  multiGetTail(multi: number): T[] {
    if (multi >= this.items.length) {
      // 长度不够了！全部返回
      return [...this.items];
    } else {
      // 长度足够
      const result: T[] = [];
      for (let i = this.items.length - multi; i < this.items.length; i++) {
        result.push(this.items[i]);
      }
      return result;
    }
  }
}
