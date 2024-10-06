import { Canvas } from "../Canvas";
import { Vector } from "../dataStruct/Vector";

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
  public mouseDoubleClick: (event: MouseEvent) => void = (_: MouseEvent) => {};

  public init() {
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    Canvas.element.addEventListener("mousedown", this.mousedown);
    Canvas.element.addEventListener("mouseup", this.mouseup);
    Canvas.element.addEventListener("mousemove", this.mousemove);
    Canvas.element.addEventListener("wheel", this.mousewheel);
    Canvas.element.addEventListener("dblclick", this.mouseDoubleClick);
  }
  public destroy() {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    Canvas.element.removeEventListener("mousedown", this.mousedown);
    Canvas.element.removeEventListener("mouseup", this.mouseup);
    Canvas.element.removeEventListener("mousemove", this.mousemove);
    Canvas.element.removeEventListener("wheel", this.mousewheel);
    Canvas.element.removeEventListener("dblclick", this.mouseDoubleClick);
    console.log(this.lastMoveLocation);
    this.lastMoveLocation = Vector.getZero();
  }
}
