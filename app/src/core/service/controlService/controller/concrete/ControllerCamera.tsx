/**
 * 存放具体的控制器实例
 */

import { CursorNameEnum } from "../../../../../types/cursors";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { EntityCreateFlashEffect } from "../../../feedbackService/effectEngine/concrete/EntityCreateFlashEffect";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 摄像机控制器
 */
export const ControllerCamera = new ControllerClass();

let isPressingCtrl = false;
let isPreGrabbingWhenSpace = false;

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
    if (!isPreGrabbingWhenSpace) {
      isPreGrabbingWhenSpace = true;
      Controller.setCursorNameHook(CursorNameEnum.Grab);
    }
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
    if (isPreGrabbingWhenSpace) {
      isPreGrabbingWhenSpace = false;
      Controller.setCursorNameHook(CursorNameEnum.Default);
    }
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

ControllerCamera.mousedown = (event: MouseEvent) => {
  if (Controller.isCameraLocked) {
    return;
  }
  if (event.button === 0 && Controller.pressingKeySet.has(" ")) {
    Controller.setCursorNameHook(CursorNameEnum.Grabbing);
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
  // 空格+左键 拖动视野
  if (Controller.pressingKeySet.has(" ") && Controller.isMouseDown[0]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 0);
    return;
  }
  // 中键按下拖动视野
  if (Controller.isMouseDown[1]) {
    if (event.ctrlKey) {
      // ctrl键按下时,不允许移动视野
      return;
    }
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    Controller.setCursorNameHook(CursorNameEnum.Grabbing);
  }
  // 侧键按下拖动视野
  if (Controller.isMouseDown[4]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 4);
    Controller.setCursorNameHook(CursorNameEnum.Grabbing);
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
    Controller.setCursorNameHook(CursorNameEnum.Grabbing);
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
  if (event.button === 0 && Controller.pressingKeySet.has(" ")) {
    if (isPreGrabbingWhenSpace) {
      Controller.setCursorNameHook(CursorNameEnum.Grab);
    }
  }
  if (event.button === 1) {
    // 中键松开
    Controller.setCursorNameHook(CursorNameEnum.Default);
  }
  if (event.button === 4) {
    Controller.setCursorNameHook(CursorNameEnum.Default);
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
  const isUsingTouchPad = !isMouseWheel(event);
  if (!Stage.enableWindowsTouchPad) {
    if (isUsingTouchPad) {
      // 禁止使用触摸板
      Stage.effectMachine.addEffect(TextRiseEffect.default("已禁用触控板滚动"));
      return;
    }
  }
  // 👇下面都是允许使用触控板的操作
  if (isUsingTouchPad) {
    // 是触控板
    // zoomCameraByTouchPadTwoFingerMove(event);
    moveCameraByTouchPadTwoFingerMove(event);
    return;
  }
  // 获取触发滚轮的鼠标位置
  const mouseLocation = new Vector(event.clientX, event.clientY);
  // 计算鼠标位置在视野中的位置
  const worldLocation = Renderer.transformView2World(mouseLocation);
  Camera.targetLocationByScale = worldLocation;

  if (Controller.pressingKeySet.has("shift")) {
    if (Camera.mouseWheelWithShiftMode === "zoom") {
      zoomCameraByMouseWheel(event);
    } else if (Camera.mouseWheelWithShiftMode === "move") {
      moveCameraByMouseWheel(event);
    } else if (Camera.mouseWheelWithShiftMode === "moveX") {
      moveXCameraByMouseWheel(event);
    }
  } else if (Controller.pressingKeySet.has("control")) {
    // 不要在节点上滚动
    const entity = StageManager.findEntityByLocation(worldLocation);
    if (entity !== null) {
      // 给这个entity一个特效
      Stage.effectMachine.addEffect(EntityCreateFlashEffect.fromRectangle(entity.collisionBox.getRectangle()));
    } else {
      if (Camera.mouseWheelWithCtrlMode === "zoom") {
        zoomCameraByMouseWheel(event);
      } else if (Camera.mouseWheelWithCtrlMode === "move") {
        moveCameraByMouseWheel(event);
      } else if (Camera.mouseWheelWithCtrlMode === "moveX") {
        moveXCameraByMouseWheel(event);
      }
    }
  } else {
    if (Camera.mouseWheelMode === "zoom") {
      zoomCameraByMouseWheel(event);
    } else if (Camera.mouseWheelMode === "move") {
      moveCameraByMouseWheel(event);
    } else if (Camera.mouseWheelMode === "moveX") {
      moveXCameraByMouseWheel(event);
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

// function zoomCameraByTouchPadTwoFingerMove(event: WheelEvent) {
//   // 过滤 -0
//   if (Math.abs(event.deltaY) < 0.1) {
//     return;
//   }
//   const newValue = event.deltaY / 1000;

//   Camera.targetScale *= 1 + newValue;
//   // 限制
//   Camera.targetScale = Math.min(10, Math.max(Camera.targetScale, 0.1));
// }

function moveCameraByTouchPadTwoFingerMove(event: WheelEvent) {
  // 过滤 -0
  if (Math.abs(event.deltaX) < 0.1 && Math.abs(event.deltaY) < 0.1) {
    return;
  }
  const dx = event.deltaX / 500;
  const dy = event.deltaY / 500;
  const diffLocation = new Vector(dx, dy).multiply((Camera.moveAmplitude * 50) / Camera.currentScale);
  Camera.location = Camera.location.add(diffLocation);
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
function moveXCameraByMouseWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    // 向上滚动是左移
    Camera.location = Camera.location.add(new Vector((Camera.moveAmplitude * 50) / Camera.currentScale, 0));
  } else if (event.deltaY < 0) {
    // 向下滚动是右移
    Camera.location = Camera.location.add(new Vector((-Camera.moveAmplitude * 50) / Camera.currentScale, 0));
  }
}

/**
 * 返回true：是鼠标滚轮事件
 * 返回false：是触摸板事件
 * @param event
 * @returns
 */
function isMouseWheel(event: WheelEvent): boolean {
  // 先看X轴的滚动
  if (event.deltaX !== 0) {
    // 向右滚动是缩小
    const intDiff = Math.round(Math.abs(event.deltaX));
    if (intDiff % 100 === 0 || intDiff % 133 === 0 || intDiff % 166 === 0) {
      // 绝对没问题
      return true;
    } else {
      return false;
    }
  }
  // 先看Y轴的滚动
  if (event.deltaY !== 0) {
    const intDiff = Math.round(Math.abs(event.deltaY));
    if (intDiff % 100 === 0 || intDiff % 133 === 0 || intDiff % 166 === 0) {
      // 绝对没问题
      return true;
    } else {
      return false;
    }
  }
  return false;
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
