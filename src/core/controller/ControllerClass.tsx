import { Vector } from "../dataStruct/Vector";
import { Canvas } from "../stage/Canvas";
import { Stage } from "../stage/Stage";

/**
 * 控制器类，用于处理事件绑定和解绑
 * 每一个对象都是一个具体的功能
 */
export class ControllerClass {
  constructor() {}

  public lastMoveLocation: Vector = Vector.getZero();
  private lastClickTime: number = 0;
  private lastClickLocation: Vector = Vector.getZero();

  public keydown: (event: KeyboardEvent) => void = () => {};
  public keyup: (event: KeyboardEvent) => void = () => {};
  public mousedown: (event: MouseEvent) => void = () => {};
  public mouseup: (event: MouseEvent) => void = () => {};
  public mousemove: (event: MouseEvent) => void = () => {};
  public mousewheel: (event: WheelEvent) => void = () => {};
  public mouseDoubleClick: (event: MouseEvent) => void = () => {};
  public touchstart: (event: TouchEvent) => void = () => {};
  public touchmove: (event: TouchEvent) => void = () => {};
  public touchend: (event: TouchEvent) => void = () => {};

  /**
   * 这个函数将在总控制器初始化是统一调用。
   * 调用之前，确保实例控制器的事件函数已经被赋值
   * 如果没有赋值被自动过滤，
   * 一旦绑定，后期就一定不要再换绑！
   */
  public init() {
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
    Canvas.element.addEventListener("mousedown", this._mousedown);
    Canvas.element.addEventListener("mouseup", this.mouseup);
    Canvas.element.addEventListener("mousemove", this.mousemove);
    Canvas.element.addEventListener("wheel", this.mousewheel);
    Canvas.element.addEventListener("touchstart", this._touchstart);
    Canvas.element.addEventListener("touchmove", this._touchmove);
    Canvas.element.addEventListener("touchend", this._touchend);
    // 有待优雅
  }
  public destroy() {
    window.removeEventListener("keydown", this.keydown);
    window.removeEventListener("keyup", this.keyup);
    Canvas.element.removeEventListener("mousedown", this._mousedown);
    Canvas.element.removeEventListener("mouseup", this.mouseup);
    Canvas.element.removeEventListener("mousemove", this.mousemove);
    Canvas.element.removeEventListener("wheel", this.mousewheel);
    Canvas.element.removeEventListener("touchstart", this._touchstart);

    this.lastMoveLocation = Vector.getZero();
  }

  private _mousedown = (event: MouseEvent) => {
    this.mousedown(event);
    // 检测双击
    const now = new Date().getTime();
    if (
      now - this.lastClickTime < 300 &&
      this.lastClickLocation.distance(
        new Vector(event.clientX, event.clientY),
      ) < 5
    ) {
      this.mouseDoubleClick(event);
    }
    this.lastClickTime = now;
    this.lastClickLocation = new Vector(event.clientX, event.clientY);
  };
  private _touchstart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[event.touches.length - 1] as any as MouseEvent;
    // @ts-expect-error 必须给他来一个button属性
    touch.button = 0;
    if (event.touches.length > 1) {
      Stage.isSelecting = false;
    }
    this._mousedown(touch);
  };
  private _touchmove = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[event.touches.length - 1] as any as MouseEvent;
    // @ts-expect-error 必须给他来一个button属性
    touch.button = 0;
    this.mousemove(touch);
  };
  private _touchend = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.changedTouches[
      event.changedTouches.length - 1
    ] as any as MouseEvent;
    // @ts-expect-error 必须给他来一个button属性
    touch.button = 0;
    this.mouseup(touch);
  };
}
