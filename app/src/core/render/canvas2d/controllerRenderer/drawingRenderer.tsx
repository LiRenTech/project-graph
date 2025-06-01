import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Controller } from "../../../service/controlService/controller/Controller";
import { MouseLocation } from "../../../service/controlService/MouseLocation";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../stage/Camera";
import { LeftMouseModeEnum, Stage } from "../../../stage/Stage";
import { CurveRenderer } from "../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../basicRenderer/shapeRenderer";
import { TextRenderer } from "../basicRenderer/textRenderer";
import { Renderer } from "../renderer";

/**
 * 绘画控制器
 */
export namespace DrawingControllerRenderer {
  /**
   * 渲染预渲染的涂鸦
   */
  export function renderTempDrawing() {
    const currentStrokeColor = Stage.drawingMachine.getCurrentStrokeColor();

    if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      // 画鼠标绘制过程，还未抬起鼠标左键的 笔迹
      if (Stage.drawingMachine.currentStroke.length > 0) {
        const startLocation = Stage.drawingMachine.currentStroke[0].startLocation;
        const endLocation = Renderer.transformView2World(MouseLocation.vector());

        // 正在绘制直线
        if (Controller.pressingKeySet.has("shift")) {
          // 垂直于坐标轴的直线
          if (Controller.pressingKeySet.has("control")) {
            const dy = Math.abs(endLocation.y - startLocation.y);
            const dx = Math.abs(endLocation.x - startLocation.x);
            if (dy > dx) {
              // 垂直
              endLocation.x = startLocation.x;
            } else {
              // 水平
              endLocation.y = startLocation.y;
            }

            CurveRenderer.renderSolidLine(
              Renderer.transformWorld2View(startLocation),
              Renderer.transformWorld2View(endLocation),
              currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
              Stage.drawingMachine.currentStrokeWidth * Camera.currentScale,
            );
          } else {
            CurveRenderer.renderSolidLine(
              Renderer.transformWorld2View(startLocation),
              MouseLocation.vector(),
              currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
              Stage.drawingMachine.currentStrokeWidth * Camera.currentScale,
            );
          }
        } else {
          CurveRenderer.renderPenStroke(
            Stage.drawingMachine.currentStroke.map((segment) => ({
              startLocation: Renderer.transformWorld2View(segment.startLocation),
              endLocation: Renderer.transformWorld2View(segment.endLocation),
              width: segment.width * Camera.currentScale,
            })),
            currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
          );
        }
      }
      if (Stage.drawingControlMachine.isAdjusting) {
        const circleCenter = Renderer.transformWorld2View(Stage.drawingControlMachine.startAdjustWidthLocation);
        // 鼠标正在调整状态
        ShapeRenderer.renderCircle(
          circleCenter,
          (Stage.drawingMachine.currentStrokeWidth / 2) * Camera.currentScale,
          currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
          Color.Transparent,
          0,
        );
        // 当前粗细显示
        TextRenderer.renderTextFromCenter(
          `2R: ${Stage.drawingMachine.currentStrokeWidth}px`,
          circleCenter.add(new Vector(0, (-(Stage.drawingMachine.currentStrokeWidth / 2) - 40) * Camera.currentScale)),
          24,
          currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
        );
      } else {
        // 画跟随鼠标的笔头
        // 如果粗细大于一定程度，则渲染成空心的
        if (Stage.drawingMachine.currentStrokeWidth > 10) {
          ShapeRenderer.renderCircle(
            MouseLocation.vector(),
            (Stage.drawingMachine.currentStrokeWidth / 2) * Camera.currentScale,
            Color.Transparent,
            currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
            2 * Camera.currentScale,
          );
        } else {
          ShapeRenderer.renderCircle(
            MouseLocation.vector(),
            (Stage.drawingMachine.currentStrokeWidth / 2) * Camera.currentScale,
            currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
            Color.Transparent,
            0,
          );
        }
        // 如果按下shift键，说明正在画直线
        if (Controller.pressingKeySet.has("shift")) {
          renderAxisMouse();
        }
      }
    }
  }

  /**
   * 画一个跟随鼠标的巨大十字准星
   * 直线模式
   */
  function renderAxisMouse() {
    // 画一个跟随鼠标的十字准星
    // const crossSize = 2000;

    const crossCenter = MouseLocation.vector();

    // 量角器功能
    // 计算角度，拿到两个世界坐标
    // const startLocation = Stage.drawingMachine.currentStroke[0].startLocation;
    // const endLocation = Renderer.transformView2World(MouseLocation.vector());

    renderAngleMouse(crossCenter);
  }

  let diffAngle = 0;

  export function rotateUpAngle() {
    diffAngle += 5;
    console.log("rotateUpAngle", diffAngle);
  }

  export function rotateDownAngle() {
    diffAngle -= 5;
    console.log("rotateUpAngle", diffAngle);
  }

  /**
   * 画跟随鼠标的角度量角器
   */
  function renderAngleMouse(mouseLocation: Vector) {
    const R1 = 50;
    const R2 = 60;
    const R3 = 70;
    for (let i = 0 + diffAngle; i < 360 + diffAngle; i += 5) {
      let startRadius = R1;
      let remoteRadius = R2;
      if ((i - diffAngle) % 15 === 0) {
        remoteRadius = R3;
      }
      if ((i - diffAngle) % 30 === 0) {
        startRadius = 10;
        remoteRadius = 200;
      }
      if ((i - diffAngle) % 90 === 0) {
        startRadius = 10;
        remoteRadius = 2000;
      }

      const angle = (i * Math.PI) / 180;
      const lineStart = mouseLocation.add(new Vector(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius));
      const lineEnd = mouseLocation.add(new Vector(Math.cos(angle) * remoteRadius, Math.sin(angle) * remoteRadius));
      renderLine(lineStart, lineEnd);
    }
  }

  /**
   * 画一条线，专用于在透明状态的时候能清晰的看到线条
   * 因此需要叠两层
   * @param lineStart
   * @param lineEnd
   */
  function renderLine(lineStart: Vector, lineEnd: Vector) {
    CurveRenderer.renderSolidLine(lineStart, lineEnd, StageStyleManager.currentStyle.Background, 2);
    CurveRenderer.renderSolidLine(lineStart, lineEnd, StageStyleManager.currentStyle.effects.successShadow, 0.5);
  }
}
