/**
 * 进度条数字类
 * 可用于 血量、等等的进度条使用场景
 */
export class ProgressNumber {
  /**
   *
   * @param curValue 当前的值
   * @param maxValue 进度条的最大值
   */
  constructor(
    public curValue: number,
    public maxValue: number,
  ) {}

  /**
   * 返回百分比，0-100
   */
  get percentage(): number {
    return (this.curValue / this.maxValue) * 100;
  }
  /**
   * 返回比率，0-1
   */
  get rate(): number {
    return this.curValue / this.maxValue;
  }

  get isFull(): boolean {
    return this.curValue >= this.maxValue;
  }

  get isEmpty(): boolean {
    return this.curValue <= 0;
  }

  setEmpty() {
    this.curValue = 0;
  }

  setFull() {
    this.curValue = this.maxValue;
  }

  add(value: number) {
    this.curValue += value;
    if (this.curValue > this.maxValue) {
      this.curValue = this.maxValue;
    }
  }

  clone(): ProgressNumber {
    return new ProgressNumber(this.curValue, this.maxValue);
  }

  subtract(value: number) {
    this.curValue -= value;
    if (this.curValue < 0) {
      this.curValue = 0;
    }
  }
}
