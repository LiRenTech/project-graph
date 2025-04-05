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
        if (Controller.pressingKeySet.has("shift")) {
          CurveRenderer.renderSolidLine(
            Renderer.transformWorld2View(Stage.drawingMachine.currentStroke[0].startLocation),
            MouseLocation.vector(),
            currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
            Stage.drawingMachine.currentStrokeWidth * Camera.currentScale,
          );
        } else {
          for (const segment of Stage.drawingMachine.currentStroke) {
            CurveRenderer.renderSolidLine(
              Renderer.transformWorld2View(segment.startLocation),
              Renderer.transformWorld2View(segment.endLocation),
              currentStrokeColor.a === 0 ? StageStyleManager.currentStyle.StageObjectBorder : currentStrokeColor,
              Stage.drawingMachine.currentStrokeWidth * Camera.currentScale,
            );
          }
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
    const crossSize = 2000;
    const crossCenter = MouseLocation.vector();
    const crossLine1Start = crossCenter.add(new Vector(-crossSize, 0));
    const crossLine1End = crossCenter.add(new Vector(crossSize, 0));
    const crossLine2Start = crossCenter.add(new Vector(0, -crossSize));
    const crossLine2End = crossCenter.add(new Vector(0, crossSize));
    CurveRenderer.renderSolidLine(crossLine1Start, crossLine1End, StageStyleManager.currentStyle.Background, 2);
    CurveRenderer.renderSolidLine(crossLine2Start, crossLine2End, StageStyleManager.currentStyle.Background, 2);
    CurveRenderer.renderSolidLine(
      crossLine1Start,
      crossLine1End,
      StageStyleManager.currentStyle.effects.successShadow,
      0.5,
    );
    CurveRenderer.renderSolidLine(
      crossLine2Start,
      crossLine2End,
      StageStyleManager.currentStyle.effects.successShadow,
      0.5,
    );
    // 量角器功能
    // 计算角度，拿到两个世界坐标
    // const startLocation = Stage.drawingMachine.currentStroke[0].startLocation;
    // const endLocation = Renderer.transformView2World(MouseLocation.vector());
  }
}
