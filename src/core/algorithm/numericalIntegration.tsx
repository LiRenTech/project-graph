/**
 * 数值积分的算法合集
 */
export namespace NumericalIntegration {
  /**
   * 使用romberg算法对函数func在[0, 1]区间上进行数值积分，确保绝对误差小于error
   * 参考网址 https://math.fandom.com/zh/wiki/Romberg_%E7%AE%97%E6%B3%95?variant=zh-sg
   * @param func 被积函数
   * @param error 误差
   */
  export function romberg(func: (x: number) => number, error: number): number {
    const t: number[][] = [[(func(0) + func(1)) / 2]];
    function tJK(t: number[][], j: number, k: number): number {
      return (
        (Math.pow(4, j) * t[j - 1][k + 1] - t[j - 1][k]) / (Math.pow(4, j) - 1)
      );
    }
    function extendsTj(t: number[][], j: number): number {
      if (j == 0) {
        const k = t[0].length;
        const twoPowK = Math.pow(2, k);
        let sum = 0;
        for (let j = 1; j <= Math.pow(2, k - 1); j++) {
          sum += func((2 * j - 1) / twoPowK);
        }
        sum = sum / twoPowK + t[0][k - 1] / 2;
        t[0].push(sum);
        return sum;
      } else {
        const val = tJK(t, j, t[j].length);
        t[j].push(val);
        return val;
      }
    }
    extendsTj(t, 0);
    extendsTj(t, 0);
    for (let j = 1; ; j++) {
      t.push([]);
      for (let i = 0; i < j; i++) {
        extendsTj(t, i);
      }
      extendsTj(t, j);
      const tj1 = extendsTj(t, j);
      const tj2 = extendsTj(t, j);
      if (Math.abs(tj2 - tj1) < error) {
        return tj1;
      }
    }
  }
}
