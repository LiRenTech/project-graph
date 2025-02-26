/**
 * 存放具体的控制器实例
 */

import { CursorNameEnum } from "../../../../../types/cursors";
import { ArrayFunctions } from "../../../../algorithm/arrayFunctions";
import { LimitLengthQueue } from "../../../../dataStruct/LimitLengthQueue";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { EntityCreateFlashEffect } from "../../../feedbackService/effectEngine/concrete/EntityCreateFlashEffect";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewOutlineFlashEffect } from "../../../feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 处理键盘按下事件
 * @param event - 键盘事件
 */
export class ControllerCameraClass extends ControllerClass {
  // 是否正在使用
  public isUsingMouseGrabMove = false;
  private lastMousePressLocation: Vector[] = [Vector.getZero(), Vector.getZero(), Vector.getZero()];

  public keydown: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
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
  public keyup: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
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

  public mousedown = (event: MouseEvent) => {
    if (Controller.isCameraLocked) {
      return;
    }
    if (event.button === 0 && Controller.pressingKeySet.has(" ")) {
      Controller.setCursorNameHook(CursorNameEnum.Grabbing);
      this.isUsingMouseGrabMove = true;
    }
    if (event.button === 1) {
      // 中键按下
      this.isUsingMouseGrabMove = true;
    }
    if (Stage.mouseRightDragBackground === "moveCamera" && event.button === 2) {
      // 右键按下
      this.isUsingMouseGrabMove = true;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.x, event.y));
    // 获取左右中键
    this.lastMousePressLocation[event.button] = pressWorldLocation;
  };

  /**
   * 处理鼠标移动事件
   * @param event - 鼠标事件
   */
  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Controller.isCameraLocked) {
      return;
    }
    if (!this.isUsingMouseGrabMove) {
      return;
    }
    // 空格+左键 拖动视野
    if (Controller.pressingKeySet.has(" ") && Controller.isMouseDown[0]) {
      this.moveCameraByMouseMove(event.clientX, event.clientY, 0);
      return;
    }
    // 中键按下拖动视野
    if (Controller.isMouseDown[1]) {
      if (event.ctrlKey) {
        // ctrl键按下时,不允许移动视野
        return;
      }
      this.moveCameraByMouseMove(event.clientX, event.clientY, 1);
      Controller.setCursorNameHook(CursorNameEnum.Grabbing);
    }
    // 侧键按下拖动视野
    if (Controller.isMouseDown[4]) {
      this.moveCameraByMouseMove(event.clientX, event.clientY, 4);
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
      this.moveCameraByMouseMove(event.clientX, event.clientY, 2);
      Controller.setCursorNameHook(CursorNameEnum.Grabbing);
    }
  };

  public mouseMoveOutWindowForcedShutdown() {
    this.isUsingMouseGrabMove = false;
    Controller.setCursorNameHook(CursorNameEnum.Default);
    Stage.effectMachine.addEffect(ViewOutlineFlashEffect.normal(StageStyleManager.currentStyle.effects.windowFlash));
  }

  /**
   * 处理鼠标松开事件
   * @param event - 鼠标事件
   */
  public mouseup = (event: MouseEvent) => {
    if (Controller.isCameraLocked) {
      return;
    }
    if (!this.isUsingMouseGrabMove) {
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
    this.isUsingMouseGrabMove = false;
  };
  /**
   * 处理鼠标滚轮事件
   * @param event - 滚轮事件
   */
  public mousewheel = (event: WheelEvent) => {
    if (Controller.isCameraLocked) {
      return;
    }
    // console.log(event);
    // console.log(event.deltaX, event.deltaY);
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
  /**
   * 处理鼠标双击事件
   * @param event - 鼠标事件
   */
  public mouseDoubleClick: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Stage.doubleClickMiddleMouseButton !== "adjustCamera") {
      return;
    }
    if (event.button === 1 && !Controller.isCameraLocked) {
      if (event.ctrlKey) {
        return;
      }
      // 中键双击
      Camera.resetBySelected();
    }
  };

  /**
   * 根据鼠标移动位置移动摄像机
   * @param x - 鼠标在X轴的坐标
   * @param y - 鼠标在Y轴的坐标
   * @param mouseIndex - 鼠标按钮索引
   */
  private moveCameraByMouseMove(x: number, y: number, mouseIndex: number) {
    const currentMouseMoveLocation = Renderer.transformView2World(new Vector(x, y));
    const diffLocation = currentMouseMoveLocation.subtract(this.lastMousePressLocation[mouseIndex]);
    Camera.location = Camera.location.subtract(diffLocation);
  }
}

let isPressingCtrl = false;
let isPreGrabbingWhenSpace = false;

function zoomCameraByMouseWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    Camera.targetScale *= 0.8;
  } else if (event.deltaY < 0) {
    Camera.targetScale *= 1.2;
  }
}

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

const detectDeltaY = new LimitLengthQueue<number>(100);

// 鼠标滚动一格，可能的距离数字，不同电脑上不一样
const importantNumbers = new Set<number>([]); // 100, 133, 138, 166

/**
 *
 * 区分滚轮和触摸板的核心函数
 * 返回true：是鼠标滚轮事件
 * 返回false：是触摸板事件
 * @param event
 * @returns
 */
function isMouseWheel(event: WheelEvent): boolean {
  if (event.deltaX !== 0 && event.deltaY !== 0) {
    // 斜向滚动肯定不是鼠标滚轮。因为滚轮只有横向滚轮和竖向滚轮
    return false;
  }
  if (event.deltaX === 0 && event.deltaY === 0) {
    // 无意义的滚动事件
    return false;
  }

  // 纯竖向滚动
  if (event.deltaX === 0 && event.deltaY !== 0) {
    const distance = Math.abs(event.deltaY);
    if (distance < 20) {
      // 缓慢滚动是触摸板
      return false;
    }
    // 开始序列化检测
    detectDeltaY.enqueue(distance);
    const multiArray = detectDeltaY.multiGetTail(4);
    if (multiArray.length >= 4) {
      if (ArrayFunctions.isSame(multiArray)) {
        // 检测到关键数字
        // console.log("检测到关键数字", multiArray[0]);
        importantNumbers.add(distance);
        // 连续4个都一样，说明是滚轮
        // 实测发现连续三个都一样，用滚轮极小概率触发。四个都一样几乎不太可能了
        return true;
      }
    } else {
      // 长度还不足 说明刚打开软件，可能拨动了两下滚轮，也可能滑动了一下触摸板
      // 先按滚轮算
      return true;
    }

    // 是整数倍
    for (const importNumber of importantNumbers) {
      if (distance % importNumber === 0) {
        return true;
      }
    }
  }

  // 纯横向滚动
  if (event.deltaX !== 0 && event.deltaY === 0) {
    const distance = Math.abs(event.deltaY);
    if (distance < 20) {
      // 缓慢滚动是触摸板
      return false;
    }
    // 是整数倍
    for (const importNumber of importantNumbers) {
      if (distance % importNumber === 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 摄像机控制器
 */
export const ControllerCamera = new ControllerCameraClass();
