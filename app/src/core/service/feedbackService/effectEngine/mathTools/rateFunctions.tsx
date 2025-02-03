export namespace RateFunctions {
  /**
   * 从0,0点到 1,0，y值从0到1再回到0
   * @param xRate
   * @returns
   */
  export function doorFunction(xRate: number): number {
    return Math.sin(xRate * Math.PI) ** 1;
  }
}
