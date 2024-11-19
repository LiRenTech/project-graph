import { TextRiseEffect } from "../effect/concrete/TextRiseEffect";
import { StageManager } from "./stageManager/StageManager";
import { Renderer } from "../render/canvas2d/renderer";
import { Vector } from "../dataStruct/Vector";
import { Stage } from "./Stage";
import { Entity } from "../stageObject/StageObject";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Settings } from "../Settings";

/**
 * 摄像机
 *
 * 该摄像机可以看成是悬浮在空中的，能上下左右四个方向喷气的小型飞机。
 * 喷气的含义是：按下WASD键可以控制四个喷气孔喷气，产生动力，松开立刻失去动力。
 * 同时空气有空气阻力，会对速度的反方向产生阻力。
 * 但滚轮会控制摄像机的缩放镜头。同时缩放大小也会影响喷气动力的大小，越是观看细节，喷的动力越小，移动越慢。
 */
export namespace Camera {
  // TODO: 这些物理参数要和设置对接
  /**
   * 每个方向上的动力矢量大小
   */
  export let moveAmplitude = 2;
  /**
   * 空气摩擦力系数
   */
  export let frictionCoefficient = 0.1;
  /**
   * 空气摩擦力速度指数
   * 指数=2，表示 f = -k * v^2
   * 指数=1，表示 f = -k * v
   * 指数越大，速度衰减越快
   */
  export const frictionExponent = 1.5;
  /**
   * 摄像机的位置（世界坐标）
   */
  export let location: Vector = Vector.getZero();
  /** 当前的 画布/摄像机移动的速度矢量 */
  export let speed: Vector = Vector.getZero();

  /** 当前的 移动加速度 */
  export const accelerate: Vector = Vector.getZero();

  /**
   * 可以看成一个九宫格，主要用于处理 w s a d 按键移动，
   * 当同时按下w和s，这个值会是(-1,-1)，表示朝着左上移动
   */
  // eslint-disable-next-line prefer-const
  export let accelerateCommander: Vector = Vector.getZero();

  /**
   * 当前镜头缩放比例 >1放大 <1缩小
   * 会逐渐趋近于目标缩放比例
   */
  export let currentScale: number = 1;
  /** 目标镜头缩放比例 */
  export let targetScale: number = 1;
  /**
   * 逐渐逼近的速度倍率。
   * 1表示瞬间就到达目标缩放比例，
   * 0.5表示不断的以一半逼近目标
   */
  export let scaleExponent: number = 0.11;

  /**
   * 震动特效导致的位置偏移
   * 也就是当有震动特效的时候，不是舞台在震动，而是摄像机在震动
   */
  export const shakeLocation: Vector = Vector.getZero();

  // IDEA: 突然有一个好点子
  // 把wsad移动的逻辑改成瞬间爆炸的冲刺一小段距离，而不是改成直接赋予永久的作用力方向然后再撤销
  // 这样可以避免好多潜在bug
  // 但这样估计就又不流畅了

  export function frameTick() {
    // 计算摩擦力 与速度方向相反,固定值,但速度为0摩擦力就不存在
    // 获得速度的大小和方向

    if (Number.isNaN(location.x) || Number.isNaN(location.y)) {
      // const dialog = useDialog();
      // dialog.show({
      //   title: "派蒙",
      //   content: "前面的区域以后再来探索吧？",
      //   type: "error",
      // });
      Stage.effects.push(
        new TextRiseEffect("派蒙：前面的区域以后再来探索吧？"),
      );
      speed = Vector.getZero();
      reset();
      return;
    }

    // 回弹效果
    if (currentScale < 0.005) {
      targetScale = 0.01;
    }
    // 彩蛋
    if (currentScale > 100) {
      currentScale = 0.001;
      targetScale = 0;
    }

    let friction = Vector.getZero();

    if (!speed.isZero()) {
      const speedSize = speed.magnitude();
      // 计算摩擦力
      friction = speed
        .normalize()
        .multiply(-1)
        .multiply(
          Camera.frictionCoefficient * speedSize ** Camera.frictionExponent,
        );
    }

    // 速度 = 速度 + 加速度（各个方向的力之和）
    speed = speed
      .add(
        accelerateCommander
          /** 摄像机 >1放大 <1缩小，为了让放大的时候移动速度慢，所以取倒数 */
          .multiply(Camera.moveAmplitude * (1 / currentScale)),
      )
      .add(friction);
    location = location.add(speed);

    // 处理缩放
    if (currentScale < targetScale) {
      currentScale = Math.min(
        currentScale + (targetScale - currentScale) * scaleExponent,
        targetScale,
      );
    } else if (currentScale > targetScale) {
      currentScale = Math.max(
        currentScale - (currentScale - targetScale) * scaleExponent,
        targetScale,
      );
    }
    // 性能优化之，将缩放小数点保留四位
    currentScale = parseFloat(currentScale.toFixed(4));
  }

  // 确保这个函数在软件打开的那一次调用
  export function init() {
    Settings.watch("scaleExponent", (value) => {
      scaleExponent = value;
    });
    Settings.watch("moveAmplitude", (value) => {
      moveAmplitude = value;
    });
    Settings.watch("moveFriction", (value) => {
      frictionCoefficient = value;
    });
  }

  /**
   * 重置摄像机的缩放，让其画面刚好能容下舞台上所有内容的外接矩形
   * 还是不要有缩放了，因为缩放会带来一点卡顿（2024年10月25日）
   */
  export function reset() {
    Camera.location = StageManager.getCenter();
    // Camera.currentScale = 0.01;

    Camera.currentScale = Math.min(
      Renderer.h / StageManager.getSize().y,
      Renderer.w / StageManager.getSize().x,
    );
    Camera.targetScale = Camera.currentScale;
  }

  export function resetBySelected() {
    const selectedEntity: Entity[] = StageManager.getSelectedEntities();
    if (selectedEntity.length === 0) {
      reset();
      return;
    }
    const viewRectangle = Rectangle.getBoundingRectangle(
      selectedEntity.map((e) => e.collisionBox.getRectangle()),
    );
    const center = viewRectangle.center;
    Camera.location = center;
    Camera.currentScale = Math.min(
      Renderer.h / viewRectangle.size.y,
      Renderer.w / viewRectangle.size.x,
    );
    Camera.targetScale = Camera.currentScale;
  }

  export function resetScale() {
    Camera.currentScale = 1;
    Camera.targetScale = 1;
  }
}
