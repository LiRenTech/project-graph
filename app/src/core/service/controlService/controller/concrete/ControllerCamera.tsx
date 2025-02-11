/**
 * 存放具体的控制器实例
 */

import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
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
  if (Controller.keyMap[key] && Camera.allowMoveCameraByWSAD) {
    if (Controller.pressingKeySet.has("control")) {
      // ctrl按下时，可能在按 ctrl+s 保存，防止出现冲突
      isPressingCtrl = true;
      return;
    }

    let addAccelerate = Controller.keyMap[key];
    if (Camera.cameraKeyboardMoveReverse) {
      addAccelerate = addAccelerate.multiply(-1);
    }
    // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
    Camera.accelerateCommander = Camera.accelerateCommander.add(addAccelerate).limitX(-1, 1).limitY(-1, 1);
  }
  if (key === " ") {
    Controller.setCursorName("grab");
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

  if (Controller.keyMap[key] && Camera.allowMoveCameraByWSAD) {
    if (isPressingCtrl) {
      // ctrl按下时，可能在按 ctrl+s 保存，防止出现冲突
      return;
    }
    let addAccelerate = Controller.keyMap[key];
    if (Camera.cameraKeyboardMoveReverse) {
      addAccelerate = addAccelerate.multiply(-1);
    }
    // 当松开某一个方向的时候,相当于停止加速度
    Camera.accelerateCommander = Camera.accelerateCommander.subtract(addAccelerate).limitX(-1, 1).limitY(-1, 1);
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
  const currentMouseMoveLocation = Renderer.transformView2World(new Vector(x, y));
  const diffLocation = currentMouseMoveLocation.subtract(Controller.lastMousePressLocation[mouseIndex]);
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
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    // 检测是否移动到视野边缘
    const viewLocation = new Vector(event.clientX, event.clientY);
    const viewRectangle = Renderer.getCoverWorldRectangle().transformWorld2View();
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
    moveCameraByMouseMove(event.clientX, event.clientY, 0);
    Controller.setCursorName("grabbing");
    return;
  }
  // 中键按下拖动视野
  if (Controller.isMouseDown[1]) {
    if (event.ctrlKey) {
      // ctrl键按下时,不允许移动视野
      return;
    }
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    Controller.setCursorName("grabbing");
  }
  // 侧键按下拖动视野
  if (Controller.isMouseDown[4]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 4);
    Controller.setCursorName("grabbing");
  }
  if (Stage.mouseRightDragBackground === "moveCamera" && Controller.isMouseDown[2]) {
    // 还要保证这个鼠标位置没有悬浮在什么东西上
    const mouseLocation = new Vector(event.clientX, event.clientY);
    const worldLocation = Renderer.transformView2World(mouseLocation);
    const entity = StageManager.findEntityByLocation(worldLocation);
    if (Stage.connectMachine.isUsing) {
      return;
    }
    if (entity !== null) {
      return;
    }
    moveCameraByMouseMove(event.clientX, event.clientY, 2);
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
    if (lastMouseMiddleUpLocation.nearlyEqual(lastMouseMiddleDownLocation, 10)) {
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
  // 禁用触控板在这里的滚动
  // 获取触发滚轮的鼠标位置
  const mouseLocation = new Vector(event.clientX, event.clientY);
  // 计算鼠标位置在视野中的位置
  const worldLocation = Renderer.transformView2World(mouseLocation);
  Camera.targetLocationByScale = worldLocation;

  if (Controller.pressingKeySet.has("shift")) {
    if (Camera.mouseWheelWithShiftMode === "zoom") {
      zoomCameraByMouseWheel(event);
    } else {
      moveCameraByMouseWheel(event);
    }
  } else if (Controller.pressingKeySet.has("control")) {
    // 不要在节点上滚动
    const entity = StageManager.findEntityByLocation(worldLocation);
    if (entity !== null) {
      // if (entity instanceof PortalNode) {
      //   if (event.deltaY > 0) {
      //     entity.zoomIn();
      //   } else {
      //     entity.zoomOut();
      //   }
      //   return;
      // }
    } else {
      zoomCameraByMouseWheel(event);
    }
  } else {
    if (Camera.mouseWheelMode === "zoom") {
      zoomCameraByMouseWheel(event);
    } else {
      moveCameraByMouseWheel(event);
    }
  }

  // 滚轮横向滚动是水平移动
  if (event.deltaX > 0) {
    // 左移动
    Camera.location = Camera.location.add(new Vector((-Camera.moveAmplitude * 50) / Camera.currentScale, 0));
  } else if (event.deltaX < 0) {
    // 右移动
    Camera.location = Camera.location.add(new Vector((Camera.moveAmplitude * 50) / Camera.currentScale, 0));
  }
};
function zoomCameraByMouseWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    Camera.targetScale *= 0.8;
  } else if (event.deltaY < 0) {
    Camera.targetScale *= 1.2;
  }
}
function moveCameraByMouseWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    // 向上滚动是上移
    Camera.location = Camera.location.add(new Vector(0, (Camera.moveAmplitude * 50) / Camera.currentScale));
  } else if (event.deltaY < 0) {
    // 向下滚动是下移
    Camera.location = Camera.location.subtract(new Vector(0, (Camera.moveAmplitude * 50) / Camera.currentScale));
  }
}
/**
 * 如果使用了鼠标滚轮，则x或y的滚动必有一个接近100
 * @param event
 */
// 实测并不是这样，实际上web有可能是133不一定是100
// 触控板最慢速移动可能是1.3，也不一定是1
// function isUseMouse(event: WheelEvent) {
//   if (
//     Math.round(Math.abs(event.deltaX)) === 100 ||
//     Math.round(Math.abs(event.deltaY)) === 100
//   ) {
//     return true;
//   }
//   return false;
// }

/**
 * 处理鼠标双击事件
 * @param event - 鼠标事件
 */
ControllerCamera.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button === 1 && !Controller.isCameraLocked) {
    if (event.ctrlKey) {
      return;
    }
    // 中键双击
    Camera.reset();
  }
};
