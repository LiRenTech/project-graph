import { Vector } from "../dataStruct/Vector";
import { Renderer } from "../render/canvas2d/renderer";
import { StageManager } from "../stage/stageManager/StageManager";
import { Camera } from "../stage/Camera";
import { ControllerCamera } from "./concrete/ControllerCamera";
import { ControllerNodeRotation } from "./concrete/ControllerNodeRotation";
import { ControllerNodeConnection } from "./concrete/ControllerNodeConnection";
import { ControllerCutting } from "./concrete/ControllerCutting";
import { ControllerNodeMove } from "./concrete/ControllerNodeMove";
import { Canvas } from "../stage/Canvas";
import { ControllerRectangleSelect } from "./concrete/ControllerRectangleSelect";
import { ControllerNodeEdit } from "./concrete/ControllerNodeEdit";
import { ControllerNodeCreate } from "./concrete/ControllerNodeCreate";
import { ControllerEdgeEdit } from "./concrete/ControllerEdgeEdit";
import { ControllerDrawing } from "./concrete/ControllerDrawing";

/**
 * 控制器，控制鼠标、键盘事件
 *
 * 想到一个点子：把每隔功能都功能拆成 mouse down,move,up 三个函数，
 * 然后再统一集成到这里。
 */
export namespace Controller {
  /**
   * 在上层接收React提供的state修改函数
   */
  export let setCursorName: (_: string) => void = (_) => {};

  // 检测正在按下的键
  export const pressingKeySet: Set<string> = new Set();
  export function pressingKeysString(): string {
    let res = "";
    for (const key of pressingKeySet) {
      res += `[${key}]` + " ";
    }
    return res;
  }
  // 按键映射
  export const keyMap: { [key: string]: Vector } = {
    w: new Vector(0, -1),
    s: new Vector(0, 1),
    a: new Vector(-1, 0),
    d: new Vector(1, 0),
  };

  /**
   * 存放鼠标 左 中 右 键上次 "按下" 时候的world位置
   */
  export const lastMousePressLocation: Vector[] = [
    Vector.getZero(),
    Vector.getZero(),
    Vector.getZero(),
  ];
  export function lastMousePressLocationString(): string {
    return lastMousePressLocation.map((v) => v.toString()).join(",");
  }
  /**
   * 存放鼠标 左 中 右 键上次 "松开" 时候的world位置
   */
  const lastMouseReleaseLocation: Vector[] = [
    Vector.getZero(),
    Vector.getZero(),
    Vector.getZero(),
  ];
  export function lastMouseReleaseLocationString(): string {
    return lastMouseReleaseLocation.map((v) => v.toString()).join(",");
  }
  /**
   * 是否正在进行移动节点的操作
   */
  export let isMovingNode = false;
  /**
   * 是否正在进行移动(拖拽旋转)连线的操作
   */
  export let isMovingEdge = false;
  /**
   * 为移动节点做准备，移动时，记录每上一帧移动的位置
   */
  export let lastMoveLocation = Vector.getZero();

  /**
   * 有时需要锁定相机，比如 编辑节点时
   */
  export let isCameraLocked = false;

  /**
   * 上次选中的节点
   * 仅为 Ctrl交叉选择使用
   */
  export let lastSelectedNode: Set<string> = new Set();

  export let touchStartLocation = Vector.getZero();
  export let touchStartDistance = 0;
  export let touchDelta = Vector.getZero();

  export let lastClickTime = 0;
  export let lastClickLocation = Vector.getZero();

  export let isMouseDown: boolean[] = [false, false, false];

  /**
   * 悬浮提示的边缘距离
   */
  export const edgeHoverTolerance = 10;

  /**
   * 初始化函数在页面挂在的时候调用
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
    // 所有的具体的功能逻辑封装成控制器对象
    // 当有新功能时新建控制器对象，并在这里初始化
    ControllerCamera.init();
    ControllerNodeRotation.init();
    ControllerNodeConnection.init();
    ControllerCutting.init();
    ControllerNodeMove.init();
    ControllerRectangleSelect.init();
    ControllerNodeEdit.init();
    ControllerNodeCreate.init();
    ControllerEdgeEdit.init();
    ControllerDrawing.init();
  }

  // 以下事件处理函数仅为Controller总控制器修改重要属性使用。不涉及具体的功能逻辑。

  function mousedown(event: MouseEvent) {
    event.preventDefault();
    handleMousedown(event.button, event.clientX, event.clientY);
  }

  function mouseup(event: MouseEvent) {
    event.preventDefault();
    handleMouseup(event.button, event.clientX, event.clientY);
  }

  function handleMousedown(button: number, x: number, y: number) {
    isMouseDown[button] = true;
    const pressWorldLocation = Renderer.transformView2World(new Vector(x, y));
    // 获取左右中键
    lastMousePressLocation[button] = pressWorldLocation;
  }

  function handleMouseup(button: number, x: number, y: number) {
    isMouseDown[button] = false;
    if (
      Date.now() - lastClickTime < 200 &&
      lastClickLocation.distance(new Vector(x, y)) < 10
    ) {
      //
    }
    lastClickTime = Date.now();
    lastClickLocation = new Vector(x, y);
    // 记录松开位置
    lastMouseReleaseLocation[button] = Renderer.transformView2World(
      new Vector(x, y),
    );
  }

  function keydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    pressingKeySet.add(key);
    // 删除功能代码量太小了，暂时先直接写在这里
    if (key === "delete") {
      StageManager.deleteNodes(
        StageManager.nodes.filter((node) => node.isSelected),
      );
    }
  }

  function keyup(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (pressingKeySet.has(key)) {
      pressingKeySet.delete(key);
    }
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
  }

  function touchmove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      // HACK: 重构后这里就有问题了
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
      Camera.location = Camera.location.subtract(
        touchDelta.multiply(1 / Camera.currentScale),
      );
    }
  }

  function touchend(e: TouchEvent) {
    e.preventDefault();
    if (e.changedTouches.length === 1) {
      // HACK: 重构后这里就有问题了
      handleMouseup(
        0,
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
      );
    }
    // 移动画面
    Camera.accelerateCommander = touchDelta
      .multiply(-1)
      .multiply(Camera.currentScale)
      .limitX(-1, 1)
      .limitY(-1, 1);
    touchDelta = Vector.getZero();
    setTimeout(() => {
      Camera.accelerateCommander = Vector.getZero();
    }, 100);
  }

  export function destroy() {
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    Canvas.element.removeEventListener("mousedown", mousedown);
    Canvas.element.removeEventListener("mouseup", mouseup);
    Canvas.element.removeEventListener("touchstart", touchstart);
    Canvas.element.removeEventListener("touchmove", touchmove);
    Canvas.element.removeEventListener("touchend", touchend);
    ControllerCamera.destroy();
    ControllerNodeRotation.destroy();
    ControllerNodeConnection.destroy();
    ControllerCutting.destroy();
    ControllerNodeMove.destroy();
    ControllerRectangleSelect.destroy();
    ControllerNodeEdit.destroy();
    ControllerNodeCreate.destroy();
    ControllerEdgeEdit.destroy();
    ControllerDrawing.destroy();
    console.log("Controller destroyed.");
  }
}
