import { Vector } from "../Vector";

/**
 * 抽象的控制器类，用于处理事件绑定和解绑
 * 每一个对象都是一个具体的功能
 */
export class ControllerClass {
  constructor() {}

  public lastMoveLocation: Vector = Vector.getZero();

  public keydown: (event: KeyboardEvent) => void = (_: KeyboardEvent) => {};
  public keyup: (event: KeyboardEvent) => void = (_: KeyboardEvent) => {};
  public mousedown: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public mouseup: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public mousemove: (event: MouseEvent) => void = (_: MouseEvent) => {};
  public mousewheel: (event: WheelEvent) => void = (_: WheelEvent) => {};

  public init(canvasElement: HTMLCanvasElement) {
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    canvasElement.addEventListener("mousedown", this.mousedown);
    canvasElement.addEventListener("mouseup", this.mouseup);
    canvasElement.addEventListener("mousemove", this.mousemove);
    canvasElement.addEventListener("wheel", this.mousewheel);
  }
  public destroy(canvasElement: HTMLCanvasElement) {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    canvasElement.removeEventListener("mousedown", this.mousedown);
    canvasElement.removeEventListener("mouseup", this.mouseup);
    canvasElement.removeEventListener("mousemove", this.mousemove);
    canvasElement.removeEventListener("wheel", this.mousewheel);
    console.log(this.lastMoveLocation);
    this.lastMoveLocation = Vector.getZero();
  }
}
