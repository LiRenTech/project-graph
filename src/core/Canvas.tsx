export namespace Canvas {
  let el: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  export function init(el_: HTMLCanvasElement) {
    el = el_;
    ctx = el.getContext("2d")!;
  }
}
