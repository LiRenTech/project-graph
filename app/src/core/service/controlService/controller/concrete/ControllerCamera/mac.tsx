import { Vector } from "../../../../../dataStruct/Vector";
import { Renderer } from "../../../../../render/canvas2d/renderer";
import { Camera } from "../../../../../stage/Camera";
import { Stage } from "../../../../../stage/Stage";
import { MouseTipFeedbackEffect } from "../../../../feedbackService/effectEngine/concrete/MouseTipFeedbackEffect";
import { Settings } from "../../../../Settings";
import { Controller } from "../../Controller";

export namespace ControllerCameraMac {
  let macTrackpadScaleSensitivity = 0.5;
  export function init() {
    Settings.watch("macTrackpadScaleSensitivity", (value) => {
      macTrackpadScaleSensitivity = value;
    });
  }
  /**
   * 在mac系统下，判断是否是鼠标滚轮事件
   * @param event 事件对象
   */
  export function isMouseWheel(event: WheelEvent) {
    // 这里mac暂不考虑侧边横向滚轮。
    if (event.deltaX !== 0 && event.deltaY !== 0) {
      // 斜向滚动肯定不是鼠标滚轮。因为滚轮只有横向滚轮和竖向滚轮
      return false;
    } else {
      // 垂直方向滚动
      const distance = Math.abs(event.deltaY);
      // 在mac系统下

      // 测试者“雨幕”反馈数据：
      // 鼠标滚轮：移动距离是整数
      // 触摸板：小数

      // 测试者“大道”反馈数据：
      // 鼠标滚动一格：整数，会显示好多小数字，4 5 6 7 6 5 4这样的。

      // M4 mackbook实测：
      // 鼠标滚动一格，会显示一格数字 4.63535543
      // 反而是触摸版，会显示 (1, 4), (0, 3) .... 很多小整数向量
      if (Stage.macTrackpadAndMouseWheelDifference === "tarckpadFloatAndWheelInt") {
        if (Number.isInteger(distance)) {
          // 整数距离，是鼠标滚轮
          return true;
        } else {
          // 小数距离，是触摸板
          return false;
        }
      } else if (Stage.macTrackpadAndMouseWheelDifference === "trackpadIntAndWheelFloat") {
        if (Number.isInteger(distance)) {
          return false;
        }
        return true;
      }
      // 无法检测出逻辑
      return false;
    }
  }

  const FINGER_SCALE_MIN_DETECT_TIME = 2; // s
  // 上次检测时间
  let lastDetectTime = Date.now();
  let currentWheelMode: "fingerScale" | "mouseWheel" = "fingerScale";
  /**
   * 检测识别双指缩放
   * @param event
   */
  export function isTouchPadTwoFingerScale(event: WheelEvent): boolean {
    // 上游已经筛选出了斜向移动，现在只需要区分 上下滚动是双指缩放触发的，还是滚轮触发的
    /**
     * 区分逻辑：
     * 双指缩放的第一个触发大小的y通常不到1，极小概率是大于1的（很剧烈的双指缩放的时候）
     * 鼠标滚轮滚动的触发大小的y通常是4.xxxxx一个小数（不开启平滑滚动）
     *
     * 如果触发了一个事件移动不到1，那么后续连续触发的多个事件中都按双指缩放算
     */
    const y = event.deltaY;
    if (Math.abs(y) < 4) {
      // 一定是双指缩放！
      currentWheelMode = "fingerScale";
      lastDetectTime = Date.now();
      return true;
    } else {
      // 可能是滚轮，也可能是双指缩放的中间过程
      const currentTime = Date.now();
      const diffTime = currentTime - lastDetectTime;
      if (diffTime > FINGER_SCALE_MIN_DETECT_TIME * 1000) {
        // 间隔过大，认为是滚轮
        currentWheelMode = "mouseWheel";
        lastDetectTime = currentTime;
        return false;
      } else {
        lastDetectTime = currentTime;
        // 间隔时间太短，按照上一次的模式判断
        if (currentWheelMode === "fingerScale") {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  /**
   * mac 触发在触摸板上双指缩放的事件
   * @param event
   */
  export function handleTwoFingerScale(event: WheelEvent) {
    // 获取触发滚轮的鼠标位置
    const mouseLocation = new Vector(event.clientX, event.clientY);
    // 计算鼠标位置在视野中的位置
    const worldLocation = Renderer.transformView2World(mouseLocation);
    Camera.targetLocationByScale = worldLocation;

    // 构建幂函数 y = a ^ x
    // const power = 1.02; // 1.05 有点敏感，1.01 有点迟钝
    const power = macTrackpadScaleSensitivity * 0.14 + 1.01;
    // y 是 camera 的currentScale
    // 通过y反解x
    const currnetCameraScale = Camera.currentScale;
    const x = Math.log(currnetCameraScale) / Math.log(power);
    // x 根据滚轮事件来变化
    const diffX = event.deltaY * -1;
    const newX = x + diffX;
    // 求解新的 camera scale
    const newCameraScale = Math.pow(power, newX);
    // Camera.currentScale = newCameraScale;
    Camera.targetScale = newCameraScale;
    // Camera.setAllowScaleFollowMouseLocationTicks(2 * 60);
  }

  export function moveCameraByTouchPadTwoFingerMove(event: WheelEvent) {
    // 过滤 -0
    if (Math.abs(event.deltaX) < 0.01 && Math.abs(event.deltaY) < 0.01) {
      return;
    }
    if (Controller.pressingKeySet.has(" ")) {
      console.log("space pressed, ignore touch pad move");
      handleRectangleSelectByTwoFingerMove(event);
      return;
    }
    const dx = event.deltaX / 400;
    const dy = event.deltaY / 400;
    const diffLocation = new Vector(dx, dy).multiply((Camera.moveAmplitude * 50) / Camera.currentScale);
    Camera.location = Camera.location.add(diffLocation);
    Stage.effectMachine.addEffect(MouseTipFeedbackEffect.directionObject(diffLocation));
  }

  function handleRectangleSelectByTwoFingerMove(event: WheelEvent) {
    const dx = event.deltaX;
    const dy = event.deltaY;
    console.log("dx, dy", dx, dy);
    // TODO: 调用矩形框选
  }
}
