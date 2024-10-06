/**
 * 将Canvas标签和里面的ctx捏在一起封装成一个类
 */
export namespace Canvas {
  export let element: HTMLCanvasElement;
  export let ctx: CanvasRenderingContext2D;

  export function init(el_: HTMLCanvasElement) {
    element = el_;
    ctx = el_.getContext("2d")!;
  }
}
