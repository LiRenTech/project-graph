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
}
