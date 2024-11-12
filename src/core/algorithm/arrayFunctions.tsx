export namespace ArrayFunctions {
  /**
   * 计算总和
   */
  export function sum(arr: number[]): number {
    return arr.reduce((acc, cur) => acc + cur, 0);
  }

  /**
   * 计算平均值
   */
  export function average(arr: number[]): number {
    if (arr.length === 0) {
      throw new Error("计算平均值时，数组不能为空");
    }
    return sum(arr) / arr.length;
  }

  /**
   * 计算方差
   */
  export function variance(arr: number[]): number {
    const avg = average(arr);
    return (
      arr.reduce((acc, cur) => acc + Math.pow(cur - avg, 2), 0) / arr.length
    );
  }

  /**
   * 计算标准差
   */
  export function standardDeviation(arr: number[]): number {
    return Math.sqrt(variance(arr));
  }
}