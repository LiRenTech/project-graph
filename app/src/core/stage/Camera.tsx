import { Queue, Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import toast from "react-hot-toast";
import { Dialog } from "@/components/dialog";
import { Direction } from "@/types/directions";
import { isMac } from "@/utils/platform";
import { NumberFunctions } from "@/core/algorithm/numberFunctions";
import { Project, service } from "@/core/Project";
import { easeOutExpo } from "@/core/service/feedbackService/effectEngine/mathTools/easings";
import { Settings } from "@/core/service/Settings";
import { Entity } from "@/core/stage/stageObject/abstract/StageEntity";

/**
 * 摄像机
 *
 * 该摄像机可以看成是悬浮在空中的，能上下左右四个方向喷气的小型飞机。
 * 喷气的含义是：按下WASD键可以控制四个喷气孔喷气，产生动力，松开立刻失去动力。
 * 同时空气有空气阻力，会对速度的反方向产生阻力。
 * 但滚轮会控制摄像机的缩放镜头。同时缩放大小也会影响喷气动力的大小，越是观看细节，喷的动力越小，移动越慢。
 */
@service("camera")
export class Camera {
  /**
   * 每个方向上的动力矢量大小
   */
  moveAmplitude = 2;
  /**
   * 空气摩擦力系数
   */
  frictionCoefficient = 0.1;
  /**
   * 空气摩擦力速度指数
   * 指数=2，表示 f = -k * v^2
   * 指数=1，表示 f = -k * v
   * 指数越大，速度衰减越快
   */
  readonly frictionExponent = 1.5;

  /**
   * 摄像机的位置（世界坐标）
   * 实际上代表的是 currentLocation
   */
  location: Vector = Vector.getZero();
  /**
   * 上次鼠标缩放滚轮交互位置
   * 世界坐标
   */

  targetLocationByScale: Vector = Vector.getZero();

  /** 当前的 画布/摄像机移动的速度矢量 */
  speed: Vector = Vector.getZero();

  /**
   * 可以看成一个九宫格，主要用于处理 w s a d 按键移动，
   * 当同时按下w和s，这个值会是(-1,-1)，表示朝着左上移动
   */

  accelerateCommander: Vector = Vector.getZero();

  /**
   * 当前镜头缩放比例 >1放大 <1缩小
   * 会逐渐趋近于目标缩放比例
   */
  currentScale: number = 1;
  /** 目标镜头缩放比例 */
  targetScale: number = 1;
  /**
   * 逐渐逼近的速度倍率。
   * 1表示瞬间就到达目标缩放比例，
   * 0.5表示不断的以一半逼近目标
   */
  scaleExponent: number = 0.11;

  /**
   * 震动特效导致的位置偏移
   * 也就是当有震动特效的时候，不是舞台在震动，而是摄像机在震动
   */
  readonly shakeLocation: Vector = Vector.getZero();

  allowMoveCameraByWSAD = false;
  cameraKeyboardMoveReverse = false;
  /** 是否缩放时根据鼠标位置缩放 */
  scaleCameraByMouseLocation = true;
  limitCameraInCycleSpace = false;
  cameraCycleSpaceSizeX = 1000;
  cameraCycleSpaceSizeY = 1000;
  mouseWheelMode: Settings.Settings["mouseWheelMode"] = "zoom";
  mouseWheelWithShiftMode: Settings.Settings["mouseWheelWithShiftMode"] = "zoom";
  mouseWheelWithCtrlMode: Settings.Settings["mouseWheelWithCtrlMode"] = "zoom";
  mouseWheelWithAltMode: Settings.Settings["mouseWheelWithAltMode"] = "zoom";
  mouseSideWheelMode: Settings.Settings["mouseSideWheelMode"] = "moveX";
  private cameraKeyboardScaleRate = 0.2;
  private cameraResetViewPaddingRate = 1.5;
  cameraFollowsSelectedNodeOnArrowKeys = false;

  // pageup / pagedown 爆炸式移动

  private readonly shockMoveDiffLocationsQueue = new Queue<Vector>();
  /**
   * 触发一次翻页式移动
   *
   * 触发一次后，接下来的60帧里，摄像机都会移动一小段距离，朝向目的位置移动
   */
  pageMove(direction: Direction) {
    // 计算爆炸式移动的目标位置
    const targetLocation = this.location.clone();
    const rect = this.project.renderer.getCoverWorldRectangle();
    if (direction === Direction.Up) {
      targetLocation.y -= rect.height * 1;
    } else if (direction === Direction.Down) {
      targetLocation.y += rect.height * 1;
    } else if (direction === Direction.Left) {
      targetLocation.x -= rect.width * 1;
    } else if (direction === Direction.Right) {
      targetLocation.x += rect.width * 1;
    }
    // 生成接下来一些帧里的移动轨迹位置点。
    this.bombMove(targetLocation);
  }
  /**
   * 爆炸式移动
   * @param targetLocation 摄像机即将要移动到的世界坐标
   */
  bombMove(targetLocation: Vector, frameCount = 40) {
    // 先清空之前的队列
    this.shockMoveDiffLocationsQueue.clear();
    // 生成接下来一些帧里的移动轨迹位置点。
    const movePoints = [];
    for (let i = 0; i < frameCount; i++) {
      // 进度：0~1
      const rate = easeOutExpo(i / frameCount);
      const newPoint = this.location.add(targetLocation.subtract(this.location).multiply(rate));
      movePoints.push(newPoint);
    }
    // 根据位置轨迹点生成距离变化小向量段
    const diffLocations = [];
    for (let i = 1; i < movePoints.length; i++) {
      const diff = movePoints[i].subtract(movePoints[i - 1]);
      diffLocations.push(diff);
      // 将距离变化加入队列
      this.shockMoveDiffLocationsQueue.enqueue(diff);
    }
  }

  tick() {
    // 计算摩擦力 与速度方向相反,固定值,但速度为0摩擦力就不存在
    // 获得速度的大小和方向

    if (Number.isNaN(this.location.x) || Number.isNaN(this.location.y)) {
      // 实测只有把摩擦力和动力都拉满时才会瞬间触发NaN，当玩家正常数据状态下有意识地向远处飞时反而不会触发
      // 因此这个彩蛋可能是个bug。先暂时改成正常的提示语
      // this.project.effects.addEffect(new TextRiseEffect("派蒙：前面的区域以后再来探索吧？"));
      toast.error("数值溢出了，已自动重置视野");
      this.speed = Vector.getZero();
      this.reset();
      return;
    }

    // 回弹效果
    if (this.currentScale < 0.005) {
      this.targetScale = 0.01;
    }
    // 彩蛋
    if (this.currentScale > 100) {
      this.currentScale = 0.001;
      this.targetScale = 0.01;
      if (isMac) {
        Dialog.show({
          title: "视野已经放大到极限了",
          content: "默认快捷键F可根据内容重置视野，mac在刚启动软件的若干秒内鼠标滚轮可能过于灵敏，导致缩放过快",
          type: "info",
        });
      } else {
        toast("您已抵达微观的尽头，世界就此反转，现在回归到了宏观。默认快捷键F可根据内容重置视野");
      }
    }
    // 冲击式移动
    if (!this.shockMoveDiffLocationsQueue.isEmpty()) {
      const diffLocation = this.shockMoveDiffLocationsQueue.dequeue();
      if (diffLocation !== undefined) {
        this.location = this.location.add(diffLocation);
      }
    }

    // 计算摩擦力
    let friction = Vector.getZero();

    if (!this.speed.isZero()) {
      const speedSize = this.speed.magnitude();

      friction = this.speed
        .normalize()
        .multiply(-1)
        .multiply(this.frictionCoefficient * speedSize ** this.frictionExponent);
    }

    // 计算动力
    const power = this.accelerateCommander
      /** 摄像机 >1放大 <1缩小，为了让放大的时候移动速度慢，所以取倒数 */
      .multiply(this.moveAmplitude * (1 / this.currentScale));

    // if (isFastMovingMode) {
    //   power = power.multiply(10);
    // }

    // 速度 = 速度 + 加速度（动力+摩擦力）
    this.speed = this.speed.add(power).add(friction);
    this.location = this.location.add(this.speed);

    // 处理缩放
    // 缩放的过程中应该维持摄像机中心点和鼠标滚轮交互位置的相对视野坐标的 不变性

    /** 鼠标交互位置的view坐标系相对于画面左上角的坐标 */
    const diffViewVector = this.project.renderer.transformWorld2View(this.targetLocationByScale);
    this.dealCameraScaleInTick();
    if (this.scaleCameraByMouseLocation) {
      if (this.tickNumber > this.allowScaleFollowMouseLocationTicks) {
        this.setLocationByOtherLocation(this.targetLocationByScale, diffViewVector);
      }
    }
    // 循环空间
    if (this.limitCameraInCycleSpace) {
      this.dealCycleSpace();
    }
    this.tickNumber++;
  }
  /**
   * 当前的帧编号
   */
  private tickNumber = 0;
  /**
   * 多少帧以后，才能继续跟随鼠标缩放
   */
  private allowScaleFollowMouseLocationTicks = 0;
  setAllowScaleFollowMouseLocationTicks(ticks: number) {
    this.allowScaleFollowMouseLocationTicks = ticks;
  }

  zoomInByKeyboard() {
    this.targetScale *= 1 + this.cameraKeyboardScaleRate;
    this.allowScaleFollowMouseLocationTicks = this.tickNumber + 5 * 60;
  }

  zoomOutByKeyboard() {
    this.targetScale *= 1 - this.cameraKeyboardScaleRate;
    this.allowScaleFollowMouseLocationTicks = this.tickNumber + 5 * 60;
  }

  /**
   * 处理循环空间
   */
  private dealCycleSpace() {
    this.location.x = NumberFunctions.mod(this.location.x, this.cameraCycleSpaceSizeX);
    this.location.y = NumberFunctions.mod(this.location.y, this.cameraCycleSpaceSizeY);
    // 限制缩放不能超过循环空间大小
  }

  /**
   * 修改摄像机位置，但是通过一种奇特的方式来修改
   * 将某个世界坐标位置对准当前的某个视野坐标位置，来修改摄像机位置
   * @param otherWorldLocation
   * @param viewLocation
   */
  private setLocationByOtherLocation(otherWorldLocation: Vector, viewLocation: Vector) {
    const otherLocationView = this.project.renderer.transformWorld2View(otherWorldLocation);
    const leftTopLocationWorld = this.project.renderer.transformView2World(otherLocationView.subtract(viewLocation));
    const rect = this.project.renderer.getCoverWorldRectangle();
    this.location = leftTopLocationWorld.add(rect.size.divide(2));
  }

  /**
   * 强制清除移动动力命令
   * 防止无限滚屏
   */
  clearMoveCommander() {
    this.accelerateCommander = Vector.getZero();
  }

  /**
   * 单纯缩放镜头
   * 让currentScale不断逼近targetScale
   * @returns 缩放前后变化的比值
   */
  private dealCameraScaleInTick() {
    let newCurrentScale = this.currentScale;

    if (this.currentScale < this.targetScale) {
      newCurrentScale = Math.min(
        this.currentScale + (this.targetScale - this.currentScale) * this.scaleExponent,
        this.targetScale,
      );
    } else if (this.currentScale > this.targetScale) {
      newCurrentScale = Math.max(
        this.currentScale - (this.currentScale - this.targetScale) * this.scaleExponent,
        this.targetScale,
      );
    }
    // 性能优化之，将缩放小数点保留四位
    newCurrentScale = parseFloat(newCurrentScale.toFixed(4));
    const diff = newCurrentScale / this.currentScale;
    this.currentScale = newCurrentScale;

    return diff;
  }

  // 确保这个函数在软件打开的那一次调用
  constructor(private readonly project: Project) {
    Settings.watch("scaleExponent", (value) => {
      this.scaleExponent = value;
    });
    Settings.watch("moveAmplitude", (value) => {
      this.moveAmplitude = value;
    });
    Settings.watch("moveFriction", (value) => {
      this.frictionCoefficient = value;
    });
    Settings.watch("allowMoveCameraByWSAD", (value) => {
      this.allowMoveCameraByWSAD = value;
    });
    Settings.watch("scaleCameraByMouseLocation", (value) => {
      this.scaleCameraByMouseLocation = value;
    });
    Settings.watch("cameraKeyboardMoveReverse", (value) => {
      this.cameraKeyboardMoveReverse = value;
    });
    Settings.watch("limitCameraInCycleSpace", (value) => {
      this.limitCameraInCycleSpace = value;
    });
    Settings.watch("cameraCycleSpaceSizeX", (value) => {
      this.cameraCycleSpaceSizeX = value;
    });
    Settings.watch("cameraCycleSpaceSizeY", (value) => {
      this.cameraCycleSpaceSizeY = value;
    });
    Settings.watch("cameraKeyboardScaleRate", (value) => {
      this.cameraKeyboardScaleRate = value;
    });
    Settings.watch("mouseSideWheelMode", (value) => {
      this.mouseSideWheelMode = value;
    });
    Settings.watch("mouseWheelMode", (value) => {
      this.mouseWheelMode = value;
    });
    Settings.watch("mouseWheelWithShiftMode", (value) => {
      this.mouseWheelWithShiftMode = value;
    });
    Settings.watch("mouseWheelWithCtrlMode", (value) => {
      this.mouseWheelWithCtrlMode = value;
    });
    Settings.watch("mouseWheelWithAltMode", (value) => {
      this.mouseWheelWithAltMode = value;
    });
    Settings.watch("cameraResetViewPaddingRate", (value) => {
      this.cameraResetViewPaddingRate = value;
    });
    Settings.watch("cameraFollowsSelectedNodeOnArrowKeys", (value) => {
      this.cameraFollowsSelectedNodeOnArrowKeys = value;
    });
  }

  /**
   * 重置摄像机的缩放，让其画面刚好能容下舞台上所有内容的外接矩形
   * 还是不要有动画过度了，因为过度效果会带来一点卡顿（2024年10月25日）
   */
  reset() {
    this.location = this.project.stageManager.getCenter();
    this.targetLocationByScale = this.location.clone();
    // this.currentScale = 0.01;
    const allEntitiesSize = this.project.stageManager.getSize();
    allEntitiesSize.multiply(this.cameraResetViewPaddingRate);
    this.currentScale = Math.min(
      this.project.renderer.h / allEntitiesSize.y,
      this.project.renderer.w / allEntitiesSize.x,
    );
    this.targetScale = this.currentScale;
  }

  resetBySelected() {
    const selectedEntity: Entity[] = this.project.stageManager.getSelectedEntities();
    if (selectedEntity.length === 0) {
      this.reset();
      return;
    }
    const viewRectangle = Rectangle.getBoundingRectangle(selectedEntity.map((e) => e.collisionBox.getRectangle()));
    this.resetByRectangle(viewRectangle);
  }

  resetByRectangle(viewRectangle: Rectangle) {
    const center = viewRectangle.center;
    this.location = center;
    this.targetLocationByScale = center.clone();

    const selectedRectangleSize = viewRectangle.size.multiply(this.cameraResetViewPaddingRate);

    // 再取max 1.5 是为了防止缩放过大
    this.currentScale = Math.min(
      this.cameraResetViewPaddingRate,
      Math.min(this.project.renderer.h / selectedRectangleSize.y, this.project.renderer.w / selectedRectangleSize.x),
    );
    this.targetScale = this.currentScale;
  }

  resetScale() {
    this.currentScale = 1;
    this.targetScale = 1;
  }

  resetLocationToZero() {
    this.bombMove(Vector.getZero());
  }
}
