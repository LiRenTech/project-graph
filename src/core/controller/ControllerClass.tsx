import { Vector } from "../dataStruct/Vector";
import { Canvas } from "../stage/Canvas";

/**
 * 控制器类，用于处理事件绑定和解绑
 * 每一个对象都是一个具体的功能
 */
export class ControllerClass {
  constructor() {}

  public lastMoveLocation: Vector = Vector.getZero();

  public keydown: (event: KeyboardEvent) => void = () => {};
  public keyup: (event: KeyboardEvent) => void = () => {};
  public mousedown: (event: MouseEvent) => void = () => {};
  public mouseup: (event: MouseEvent) => void = () => {};
  public mousemove: (event: MouseEvent) => void = () => {};
  public mousewheel: (event: WheelEvent) => void = () => {};
  public mouseDoubleClick: (event: MouseEvent) => void = () => {};

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
    if (this.keydown.toString().length > 12) {
      window.removeEventListener("keydown", this.keydown);
    }
    if (this.keyup.toString().length > 12) {
      window.removeEventListener("keyup", this.keyup);
    }
    if (this.mousedown.toString().length > 12) {
      Canvas.element.removeEventListener("mousedown", this.mousedown);
    }
    if (this.mouseup.toString().length > 12) {
      Canvas.element.removeEventListener("mouseup", this.mouseup);
    }
    if (this.mousemove.toString().length > 12) {
      Canvas.element.removeEventListener("mousemove", this.mousemove);
    }
    if (this.mousewheel.toString().length > 12) {
      Canvas.element.removeEventListener("wheel", this.mousewheel);
    }
    if (this.mouseDoubleClick.toString().length > 12) {
      Canvas.element.removeEventListener("dblclick", this.mouseDoubleClick);
    }

    this.lastMoveLocation = Vector.getZero();
  }
}
