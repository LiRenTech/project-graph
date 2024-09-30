/**
 * 将Canvas标签和里面的ctx捏在一起封装成一个类
 */
export class Canvas {
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(el_: HTMLCanvasElement) {
    this.element = el_;
    this.ctx = el_.getContext("2d")!;
  }
}
