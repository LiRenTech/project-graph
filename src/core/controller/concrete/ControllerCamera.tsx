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
  if (Controller.keyMap[key]) {
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

/**
 * 处理鼠标移动事件
 * @param event - 鼠标事件
 */
ControllerCamera.mousemove = (event: MouseEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (Controller.pressingKeySet.has(" ") && Controller.isMouseDown[0]) {
    console.log("空格按下的同时按下了鼠标左键");
    moveCameraByMouseMove(event.clientX, event.clientY, 0);
    Controller.setCursorName("grabbing");
    return;
  }
  if (Controller.isMouseDown[1]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
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
  } else {
    Camera.targetScale *= 1.2;
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
}