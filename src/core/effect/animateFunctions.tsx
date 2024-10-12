/**
 * 更多的关于动画的函数
 *
 */

//
/**
 * 0 -> 1 -> 0
 * @param t
 * @returns
 */
export const reverseAnimate = (t: number) => {
  return Math.sin(t * Math.PI);
};
