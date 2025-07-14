import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";
import { ControllerCamera } from "./concrete/ControllerCamera";
import { ControllerCopy } from "./concrete/ControllerCopy";
import { ControllerCutting } from "./concrete/ControllerCutting";
import { ControllerDragFile } from "./concrete/ControllerDragFile";
import { ControllerEdgeEdit } from "./concrete/ControllerEdgeEdit";
import { ControllerEntityCreate } from "./concrete/ControllerEntityCreate";
import { ControllerLayerMoving } from "./concrete/ControllerEntityLayerMoving";
import { ControllerImageScale } from "./concrete/ControllerImageScale";
import { ControllerDrawing } from "./concrete/ControllerPenStrokeDrawing";
// import { ControllerKeyboardOnly } from "./concrete/ControllerKeyboardOnly";
import { ControllerAssociationReshape } from "./concrete/ControllerAssociationReshape";
import { ControllerEntityClickSelectAndMove } from "./concrete/ControllerEntityClickSelectAndMove";
import { ControllerNodeConnection } from "./concrete/ControllerNodeConnection";
import { ControllerNodeEdit } from "./concrete/ControllerNodeEdit";
import { ControllerRectangleSelect } from "./concrete/ControllerRectangleSelect";
import { ControllerSectionEdit } from "./concrete/ControllerSectionEdit";
// ...
import { CursorNameEnum } from "../../../../types/cursors";
import { controllerChildCamera } from "./concrete/ControllerChildCamera";
import { ControllerEntityResize } from "./concrete/ControllerEntityResize";
import { controllerPenStrokeControl } from "./concrete/ControllerPenStrokeControl";
import { isMac } from "../../../../utils/platform";
import { Stage } from "../../../stage/Stage";

/**
 * 控制器，控制鼠标、键盘事件
 *
 * 所有具体的控制功能逻辑都封装在控制器对象中
 */
export namespace Controller {
  /**
   * 在上层接收React提供的state修改函数
   */
  // eslint-disable-next-line prefer-const
  export let setCursorNameHook: (_: CursorNameEnum) => void = () => {};

  // 检测正在按下的键
  export const pressingKeySet: Set<string> = new Set();
  export function pressingKeysString(): string {
    let res = "";
    for (const key of pressingKeySet) {
      res += `[${key}]` + " ";
    }
    return res;
  }

  /**
   * 是否正在进行移动(拖拽旋转)连线的操作
   */
  // eslint-disable-next-line prefer-const
  export let isMovingEdge = false;
  /**
   * 为移动节点做准备，移动时，记录每上一帧移动的位置
   */
  // eslint-disable-next-line prefer-const
  export let lastMoveLocation = Vector.getZero();
  /**
   * 当前的鼠标的位置
   */
  // eslint-disable-next-line prefer-const
  export let mouseLocation = Vector.getZero();

  /**
   * 有时需要锁定相机，比如 编辑节点时
   */
  // eslint-disable-next-line prefer-const
  export let isCameraLocked = false;

  /**
   * 上次选中的节点
   * 仅为 Ctrl交叉选择使用
   */
  export const lastSelectedEntityUUID: Set<string> = new Set();
  export const lastSelectedEdgeUUID: Set<string> = new Set();

  export let touchStartLocation = Vector.getZero();
  export let touchStartDistance = 0;
  export let touchDelta = Vector.getZero();

  export let lastClickTime = 0;
  export let lastClickLocation = Vector.getZero();

  export const isMouseDown: boolean[] = [false, false, false];

  let lastManipulateTime = performance.now();

  /**
   * 触发了一次操作，记录时间
   */
  export function recordManipulate() {
    lastManipulateTime = performance.now();
  }

  /**
   * 检测是否已经有挺长一段时间没有操作了
   * 进而决定不刷新屏幕
   */
  export function isManipulateOverTime() {
    return performance.now() - lastManipulateTime > Renderer.renderOverTimeWhenNoManipulateTime * 1000;
  }

  /**
   * 悬浮提示的边缘距离
   */
  export const edgeHoverTolerance = 10;

  /**
   * 初始化函数在页面挂在的时候调用，将事件绑定到Canvas上
   * @param Canvas.element
   */
  export function init() {
    // 绑定事件
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    Canvas.element.addEventListener("mousedown", mousedown);
    Canvas.element.addEventListener("mouseup", mouseup);
    Canvas.element.addEventListener("touchstart", touchstart, false);
    Canvas.element.addEventListener("touchmove", touchmove, false);
    Canvas.element.addEventListener("touchend", touchend, false);
    Canvas.element.addEventListener("wheel", mousewheel, false);
    // 所有的具体的功能逻辑封装成控制器对象
    // 当有新功能时新建控制器对象，并在这里初始化
    ControllerCamera.init();
    ControllerAssociationReshape.init();
    ControllerNodeConnection.init();
    ControllerCutting.init();
    ControllerEntityClickSelectAndMove.init();
    ControllerRectangleSelect.init();
    ControllerNodeEdit.init();
    ControllerEntityCreate.init();
    ControllerEdgeEdit.init();
    ControllerDrawing.init();
    ControllerDragFile.init();
    // ControllerKeyboardOnly.init();
    ControllerCopy.init();
    ControllerSectionEdit.init();
    ControllerLayerMoving.init();
    ControllerImageScale.init();
    controllerChildCamera.init();
    controllerPenStrokeControl.init();
    ControllerEntityResize.init();
    //
  }

  // 以下事件处理函数仅为Controller总控制器修改重要属性使用。不涉及具体的功能逻辑。

  function mousedown(event: MouseEvent) {
    event.preventDefault();
    handleMousedown(event.button, event.clientX, event.clientY);
    recordManipulate();
  }

  function mouseup(event: MouseEvent) {
    event.preventDefault();
    handleMouseup(event.button, event.clientX, event.clientY);
    recordManipulate();
  }

  function mousewheel(event: WheelEvent) {
    event.preventDefault();
    // 禁用鼠标滚轮缩放
    recordManipulate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleMousedown(button: number, _x: number, _y: number) {
    isMouseDown[button] = true;

    // 左右键按下时移除所有input焦点
    if (button === 0 || button === 2) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }
  }

  function handleMouseup(button: number, x: number, y: number) {
    isMouseDown[button] = false;
    if (Date.now() - lastClickTime < 200 && lastClickLocation.distance(new Vector(x, y)) < 10) {
      //
    }
    lastClickTime = Date.now();
    lastClickLocation = new Vector(x, y);
  }

  function keydown(event: KeyboardEvent) {
    // 2025年2月1日
    // 必须要禁止ctrl f 和ctrl+g的浏览器默认行为，否则会弹出一个框
    // ctrl r 会刷新页面
    if (event.ctrlKey && (event.key === "f" || event.key === "g")) {
      event.preventDefault();
    }
    if (event.key === "F3" || event.key === "F7" || event.key === "F5") {
      // 禁用F3查找功能，防止浏览器默认行为
      // F7 插入光标浏览功能
      event.preventDefault();
    }
    if (event.key === "r" || event.key === "R") {
      // 禁用r刷新页面功能，防止浏览器默认行为
      // 如果要在开发中测试刷新，应该在DevTools界面按这个快捷键
      event.preventDefault();
    }
    // 禁止ctrl+shift+g 浏览器默认行为：查找上一个匹配项, ctrl+shift+c 打开控制台
    if (event.key === "G" || event.key === "C") {
      event.preventDefault();
    }
    if (event.key === "p") {
      // 禁用p打印功能，防止浏览器默认行为
      event.preventDefault();
    }
    if (event.key === "j") {
      // 禁用弹出下载界面功能
      event.preventDefault();
    }
    const key = event.key.toLowerCase();
    pressingKeySet.add(key);
    recordManipulate();
  }

  function keyup(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (pressingKeySet.has(key)) {
      pressingKeySet.delete(key);
    }
    if (event.key === " " && isMac) {
      // 停止框选
      Stage.rectangleSelectEngine.shutDown();
    }
    recordManipulate();
  }

  // touch相关的事件有待重构到具体的功能逻辑中

  function touchstart(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      handleMousedown(0, e.touches[0].clientX, e.touches[0].clientY);
    }
    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      touchStartLocation = center;

      // 计算初始两指间距离
      touchStartDistance = touch1.distance(touch2);
    }
    recordManipulate();
  }

  function touchmove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      // HACK: 重构后touch方法就有问题了
    }
    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      touchDelta = center.subtract(touchStartLocation);

      // 计算当前两指间的距离
      const currentDistance = touch1.distance(touch2);
      const scaleRatio = currentDistance / touchStartDistance;

      // 缩放画面
      Camera.targetScale *= scaleRatio;
      touchStartDistance = currentDistance; // 更新距离

      // 更新中心点位置
      touchStartLocation = center;

      // 移动画面
      Camera.location = Camera.location.subtract(touchDelta.multiply(1 / Camera.currentScale));
    }
    recordManipulate();
  }

  function touchend(e: TouchEvent) {
    e.preventDefault();
    if (e.changedTouches.length === 1) {
      // HACK: 重构后touch方法就有问题了
      handleMouseup(0, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    // 移动画面
    Camera.accelerateCommander = touchDelta.multiply(-1).multiply(Camera.currentScale).limitX(-1, 1).limitY(-1, 1);
    touchDelta = Vector.getZero();
    setTimeout(() => {
      Camera.accelerateCommander = Vector.getZero();
    }, 100);
    recordManipulate();
  }

  export function destroy() {
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    Canvas.element.removeEventListener("mousedown", mousedown);
    Canvas.element.removeEventListener("mouseup", mouseup);
    Canvas.element.removeEventListener("wheel", mousewheel);
    Canvas.element.removeEventListener("touchstart", touchstart);
    Canvas.element.removeEventListener("touchmove", touchmove);
    Canvas.element.removeEventListener("touchend", touchend);
    ControllerCamera.destroy();
    ControllerAssociationReshape.destroy();
    ControllerNodeConnection.destroy();
    ControllerCutting.destroy();
    ControllerEntityClickSelectAndMove.destroy();
    ControllerRectangleSelect.destroy();
    ControllerNodeEdit.destroy();
    ControllerEntityCreate.destroy();
    ControllerEdgeEdit.destroy();
    ControllerDrawing.destroy();
    ControllerDragFile.destroy();
    // ControllerKeyboardOnly.destroy();
    ControllerCopy.destroy();
    ControllerSectionEdit.destroy();
    ControllerLayerMoving.destroy();
    ControllerImageScale.destroy();
    controllerChildCamera.destroy();
    controllerPenStrokeControl.destroy();
    ControllerEntityResize.destroy();
  }
}
