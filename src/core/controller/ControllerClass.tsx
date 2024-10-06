
/**
 * 抽象的控制器类，用于处理事件绑定和解绑
 * 每一个对象都是一个具体的功能
 */
export class ControllerClass {
  constructor(public canvasElement: HTMLCanvasElement) {}

  public keydown: (event: KeyboardEvent) => void = (_: KeyboardEvent) => {};
  public keyup: (event: KeyboardEvent) => void = (_: KeyboardEvent) => {};
  public mousedown: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public mouseup: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public mousemove: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public wheel: (event: WheelEvent) => void = (_: WheelEvent) => {};

  bind() {
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    this.canvasElement.addEventListener("mousedown", this.mousedown);
    this.canvasElement.addEventListener("mouseup", this.mouseup);
    this.canvasElement.addEventListener("mousemove", this.mousemove);
    this.canvasElement.addEventListener("wheel", this.wheel);
  }
  destroy() {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    this.canvasElement.removeEventListener("mousedown", this.mousedown);
    this.canvasElement.removeEventListener("mouseup", this.mouseup);
    this.canvasElement.removeEventListener("mousemove", this.mousemove);
    this.canvasElement.removeEventListener("wheel", this.wheel);
  }
}
