import { Canvas } from "../../stage/Canvas";
import { Color, mixColors } from "../../dataStruct/Color";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { LineEffect } from "../../effect/concrete/LineEffect";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { easeInOutSine } from "../../effect/easings";
import { Rectangle } from "../../dataStruct/Rectangle";
import { Camera } from "../../stage/Camera";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "./renderer";
import { RenderUtils } from "./RenderUtils";

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
      mixColors(
        effect.color,
        new Color(0, 0, 0, 0),
        effect.timeProgress.rate,
      ),
      Color.Transparent,
      0,
    );
  }
}
