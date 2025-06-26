import { service } from "../Project";

/**
 * 将Canvas标签和里面的ctx捏在一起封装成一个类
 */
@service("canvas")
export class Canvas {
  ctx: CanvasRenderingContext2D;

  constructor(public element: HTMLCanvasElement) {
    this.ctx = element.getContext("2d")!;
  }
}
