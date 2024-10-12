import { Canvas } from "../stage/Canvas";
import { Vector } from "../dataStruct/Vector";

/**
 * 控制器类，用于处理事件绑定和解绑
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

  /**
   * 这个函数将在总控制器初始化是统一调用。
   * 调用之前，确保实例控制器的事件函数已经被赋值
   * 如果没有赋值被自动过滤，
   * 一旦绑定，后期就一定不要再换绑！
   */
  public init() {
    if (this.keydown.toString().length > 12) {
      window.addEventListener("keydown", this.keydown);
    }
    if (this.keyup.toString().length > 12) {
      window.addEventListener("keyup", this.keyup);
    }
    if (this.mousedown.toString().length > 12) {
      Canvas.element.addEventListener("mousedown", this.mousedown);
    }
    if (this.mouseup.toString().length > 12) {
      Canvas.element.addEventListener("mouseup", this.mouseup);
    }
    if (this.mousemove.toString().length > 12) {
      Canvas.element.addEventListener("mousemove", this.mousemove);
    }
    if (this.mousewheel.toString().length > 12) {
      Canvas.element.addEventListener("wheel", this.mousewheel);
    }
    if (this.mouseDoubleClick.toString().length > 12) {
      Canvas.element.addEventListener("dblclick", this.mouseDoubleClick);
    }
    // 有待优雅
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
