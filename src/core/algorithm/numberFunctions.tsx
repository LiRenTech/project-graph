/**
 * 一些和数字相关的运算方法
 */
export namespace NumberFunctions {
  /**
   * 判断两个数是否相近
   * @param number1
   * @param number2
   * @param tolerance
   * @returns
   */
  export function isNumberNear(
    number1: number,
    number2: number,
    tolerance: number,
  ): boolean {
    return Math.abs(number1 - number2) <= tolerance;
  }

  /**
   * 此函数用于放在循环函数中，生成一个周期震荡的数字
   * @param maxValue 震荡的最大值
   * @param minValue 震荡的最小值
   * @param cycleTime 周期时间，单位为秒
   */
  export function sinNumberByTime(
    maxValue: number,
    minValue: number,
    cycleTime: number,
  ) {
    const t = performance.now() / 1000;
    return (
      Math.sin(((t % cycleTime) * (Math.PI * 2)) / cycleTime) *
        (maxValue - minValue) +
      minValue
    );
  }
}
