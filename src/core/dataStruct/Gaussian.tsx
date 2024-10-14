/**
 * 高斯函数
 */
export class Gaussian {
  // 偏移量（均值）
  private mu: number;
  // 标准差
  private sigma: number;

  constructor(mu: number = 0, sigma: number = 1) {
    this.mu = mu;
    this.sigma = sigma;
  }

  // 计算高斯函数的值
  public calculate(x: number): number {
    const exponent = -((x - this.mu) ** 2) / (2 * this.sigma ** 2);
    return Math.exp(exponent);
  }

  // 将高斯函数的值归一化到 [0, 1] 范围
  public normalize(x: number): number {
    const value = this.calculate(x);
    // 由于高斯函数在 x = mu 时有最大值，所以归一化到 [0, 1]
    const max = this.calculate(this.mu);
    return value / max;
  }
}

// 示例用法
// const gaussian = new Gaussian(0, 1);
// const valueAtX = gaussian.normalize(1); // 计算 x = 1 时的归一化值
// console.log(`Normalized Gaussian value at x = 1: ${valueAtX}`);
