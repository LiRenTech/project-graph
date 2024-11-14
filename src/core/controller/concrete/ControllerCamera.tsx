/**
 * 存放具体的控制器实例
 */

import { Renderer } from "../../render/canvas2d/renderer";
import { Camera } from "../../stage/Camera";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 摄像机控制器
 */
export const ControllerCamera = new ControllerClass();

let isPressingCtrl = false;

/**
 * 处理键盘按下事件
 * @param event - 键盘事件
 */
ControllerCamera.keydown = (event: KeyboardEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  const key = event.key.toLowerCase();
  if (Controller.keyMap[key]) {
    if (Controller.pressingKeySet.has("control")) {
      // ctrl按下时，可能在按 ctrl+s 保存，防止出现冲突
      isPressingCtrl = true;
      return;
    }

    // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .add(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
  if (key === " ") {
    Controller.setCursorName("grab");
  } else if (key === "[") {
    Camera.targetScale *= 1.2;
  } else if (key === "]") {
    Camera.targetScale *= 0.8;
  }
};

/**
 * 处理键盘松开事件
 * @param event - 键盘事件
 */
ControllerCamera.keyup = (event: KeyboardEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  const key = event.key.toLowerCase();

  // 解决ctrl+s 冲突
  if (key === "control") {
    setTimeout(() => {
      isPressingCtrl = false;
    }, 500);
  }
  // ------

  if (Controller.keyMap[key]) {
    if (isPressingCtrl) {
      // ctrl按下时，可能在按 ctrl+s 保存，防止出现冲突
      return;
    }

    // 当松开某一个方向的时候,相当于停止加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .subtract(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
  if (key === " ") {
    Controller.setCursorName("default");
  }
};

/**
 * 根据鼠标移动位置移动摄像机
 * @param x - 鼠标在X轴的坐标
 * @param y - 鼠标在Y轴的坐标
 * @param mouseIndex - 鼠标按钮索引
 */
function moveCameraByMouseMove(x: number, y: number, mouseIndex: number) {
  const currentMouseMoveLocation = Renderer.transformView2World(
    new Vector(x, y),
  );
  const diffLocation = currentMouseMoveLocation.subtract(
    Controller.lastMousePressLocation[mouseIndex],
  );
  Camera.location = Camera.location.subtract(diffLocation);
}

/** 鼠标上次中键按下位置(view坐标) */
let lastMouseMiddleDownLocation = new Vector(0, 0);
let lastMouseMiddleUpLocation = new Vector(0, 0);

ControllerCamera.mousedown = (event: MouseEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (event.button === 1) {
    // 中键按下
    const newMouseMiddleDownLocation = new Vector(event.clientX, event.clientY);
    // 判断是否是原位置按下

    lastMouseMiddleDownLocation = newMouseMiddleDownLocation;
  }
};


/**
 * 处理鼠标移动事件
 * @param event - 鼠标事件
 */
ControllerCamera.mousemove = (event: MouseEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (Controller.isViewMoveByClickMiddle) {
    console.log("点击中键拖动视野");
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    // 检测是否移动到视野边缘
    const viewLocation = new Vector(event.clientX, event.clientY);
    const viewRectangle =
      Renderer.getCoverWorldRectangle().transformWorld2View();
    const diff = 25; // 视野边缘的距离
    if (
      viewLocation.x < viewRectangle.left + diff ||
      viewLocation.x > viewRectangle.right - diff ||
      viewLocation.y < viewRectangle.top + diff ||
      viewLocation.y > viewRectangle.bottom - diff
    ) {
      Controller.isViewMoveByClickMiddle = false;
    }
  }
  // 空格+左键 拖动视野
  if (Controller.pressingKeySet.has(" ") && Controller.isMouseDown[0]) {
    console.log("空格按下的同时按下了鼠标左键");
    moveCameraByMouseMove(event.clientX, event.clientY, 0);
    Controller.setCursorName("grabbing");
    return;
  }
  // 中键按下拖动视野
  if (Controller.isMouseDown[1]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    Controller.setCursorName("grabbing");
  }
  // 侧键按下拖动视野
  if (Controller.isMouseDown[4]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 4);
    Controller.setCursorName("grabbing");
  }
};

/**
 * 处理鼠标松开事件
 * @param event - 鼠标事件
 */
ControllerCamera.mouseup = (event: MouseEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (event.button === 1) {
    // 中键松开
    Controller.setCursorName("default");
    lastMouseMiddleUpLocation = new Vector(event.clientX, event.clientY);
    if (
      lastMouseMiddleUpLocation.nearlyEqual(lastMouseMiddleDownLocation, 10)
    ) {
      // 是
      Controller.isViewMoveByClickMiddle = !Controller.isViewMoveByClickMiddle;
    }
  }
  if (event.button === 4) {
    Controller.setCursorName("default");
  }
};

/**
 * 处理鼠标滚轮事件
 * @param event - 滚轮事件
 */
ControllerCamera.mousewheel = (event: WheelEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (Controller.pressingKeySet.has("control")) {
    return;
  }

  if (event.deltaY > 0) {
    Camera.targetScale *= 0.8;
  } else if (event.deltaY < 0) {
    Camera.targetScale *= 1.2;
  }

  if (event.deltaX > 0) {
    Camera.accelerateCommander = Camera.accelerateCommander
      .add(Controller.keyMap["a"])
      .limitX(-1, 1);
  } else if (event.deltaX < 0) {
    Camera.accelerateCommander = Camera.accelerateCommander
      .add(Controller.keyMap["d"])
      .limitX(-1, 1);
  }
};

/**
 * 处理鼠标双击事件
 * @param event - 鼠标事件
 */
ControllerCamera.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button === 1) {
    // 中键双击
    Camera.reset();
  }
};
