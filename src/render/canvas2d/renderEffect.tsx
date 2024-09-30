import CircleFlameEffect from "../../core/effect/concrete/circleFlameEffect";
import { Render } from "./render";
import { RenderUtils } from "./renderUtils";

export namespace RenderEffect {
  /**
   * 圆形火光特效
   * @param effect
   * @returns
   */
  export function rendCircleFlameEffect(
    render: Render,
    effect: CircleFlameEffect,
  ) {
    if (effect.timeProgress.isFull) {
      return;
    }
    effect.color.a = 1 - effect.timeProgress.rate;
    const rendRadius = effect.radius * effect.timeProgress.rate;
    RenderUtils.rendCircleTransition(
      render.ctx,
      render.transformWorld2View(effect.location),
      rendRadius * render.cameraCurrentScale,
      effect.color,
    );
  }
}
