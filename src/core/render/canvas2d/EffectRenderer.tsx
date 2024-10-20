import { Canvas } from "../../stage/Canvas";
import { Color, mixColors } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { LineEffect } from "../../effect/concrete/LineEffect";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { easeInOutSine, easeOutQuint } from "../../effect/easings";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Camera } from "../../stage/Camera";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "./renderer";
import { RenderUtils } from "./RenderUtils";
import { RectangleNoteEffect } from "../../effect/concrete/RectangleNoteEffect";
import { reverseAnimate } from "../../effect/animateFunctions";
import { ExplodeAshEffect } from "../../effect/concrete/ExplodeDashEffect";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";

/**
 * 专门编写所有的特效渲染
 */
export namespace EffectRenderer {
  /**
   * 圆形火光特效
   * @param effect
   * @returns
   */
  export function renderCircleFlameEffect(effect: CircleFlameEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    effect.color.a = 1 - effect.timeProgress.rate;
    const rendRadius = effect.radius * effect.timeProgress.rate;
    RenderUtils.renderCircleTransition(
      Renderer.transformWorld2View(effect.location),
      rendRadius * Camera.currentScale,
      effect.color,
    );
  }

  /**
   * 屏幕中央的上升文字特效
   * @param render
   * @param effect
   * @returns
   */
  export function renderTextRiseEffect(effect: TextRiseEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const centerLocation = new Vector(Renderer.w / 2, Renderer.h / 2);
    const distance = 50 * Camera.currentScale;

    Canvas.ctx.font = `${20 * Camera.currentScale}px Arial`;
    Canvas.ctx.fillStyle = Color.White.toString();
    Canvas.ctx.textAlign = "center";
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.globalAlpha = 1 - easeInOutSine(effect.timeProgress.rate);
    Canvas.ctx.fillText(
      effect.text,
      centerLocation.x,
      centerLocation.y - distance * easeInOutSine(effect.timeProgress.rate),
    );
    Canvas.ctx.globalAlpha = 1;
  }

  export function renderLineEffect(effect: LineEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    const fromLocation = Renderer.transformWorld2View(effect.fromLocation);
    const toLocation = Renderer.transformWorld2View(effect.toLocation);
    const fromColor = mixColors(
      effect.fromColor,
      effect.fromColor.toTransparent(),
      effect.timeProgress.rate,
    );
    const toColor = mixColors(
      effect.toColor,
      effect.toColor.toTransparent(),
      effect.timeProgress.rate,
    );
    RenderUtils.renderGradientLine(
      fromLocation,
      toLocation,
      fromColor,
      toColor,
      effect.lineWidth * Camera.currentScale,
    );
  }
  export function renderLineCuttingEffect(effect: LineCuttingEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    const fromLocation = Renderer.transformWorld2View(
      effect.fromLocation.add(
        effect.toLocation
          .subtract(effect.fromLocation)
          .multiply(effect.timeProgress.rate),
      ),
    );

    const toLocation = Renderer.transformWorld2View(effect.toLocation);
    const fromColor = mixColors(
      effect.fromColor,
      effect.fromColor.toTransparent(),
      effect.timeProgress.rate,
    );
    const toColor = mixColors(
      effect.toColor,
      effect.toColor.toTransparent(),
      effect.timeProgress.rate,
    );
    RenderUtils.renderGradientLine(
      fromLocation,
      toLocation,
      fromColor,
      toColor,
      effect.lineWidth * effect.timeProgress.rate,
    );
  }
  export function renderViewFlashEffect(effect: ViewFlashEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    RenderUtils.renderRect(
      new Rectangle(new Vector(-10000, -10000), new Vector(20000, 20000)),
      mixColors(effect.color, new Color(0, 0, 0, 0), effect.timeProgress.rate),
      Color.Transparent,
      0,
    );
  }

  export function renderRectangleNoteEffect(effect: RectangleNoteEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    const startRect = Renderer.getCoverWorldRectangle();
    const currentRect = new Rectangle(
      startRect.location.add(
        effect.targetRectangle.location
          .subtract(startRect.location)
          .multiply(easeOutQuint(effect.timeProgress.rate)),
      ),
      new Vector(
        startRect.size.x +
          (effect.targetRectangle.size.x - startRect.size.x) *
            easeOutQuint(effect.timeProgress.rate),
        startRect.size.y +
          (effect.targetRectangle.size.y - startRect.size.y) *
            easeOutQuint(effect.timeProgress.rate),
      ),
    );
    RenderUtils.renderRect(
      currentRect.transformWorld2View(),
      Color.Transparent,
      mixColors(
        Color.Transparent,
        effect.strokeColor,
        reverseAnimate(effect.timeProgress.rate),
      ),
      2,
      5,
    );
  }

  export function renderExplodeAshEffect(effect: ExplodeAshEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    for (const ashLocation of effect.ashLocationArray) {
      const viewLocation = Renderer.transformWorld2View(ashLocation);
      const color = mixColors(
        effect.color,
        effect.color.toTransparent(),
        effect.timeProgress.rate,
      );

      RenderUtils.renderPixel(viewLocation, color);
    }
  }
  
  export function renderNodeMoveShadowEffect(effect: NodeMoveShadowEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    for (const point of effect.pointList) {
      const viewLocation = Renderer.transformWorld2View(point);
      const color = mixColors(
        Color.White,
        Color.White.toTransparent(),
        effect.timeProgress.rate,
      );

      RenderUtils.renderPixel(viewLocation, color);
    }
  }
}
