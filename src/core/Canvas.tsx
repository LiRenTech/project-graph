import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

export namespace Canvas {
  export let app: PIXI.Application;
  export let view: Viewport;
  export const VIEW_RECT = new PIXI.Rectangle(0, 0, 2 ** 31, 2 ** 31);
  export const VIEW_CENTER = new PIXI.Point(
    VIEW_RECT.width / 2,
    VIEW_RECT.height / 2,
  );

  export async function init(): Promise<HTMLCanvasElement> {
    await initPixi();
    return app.canvas;
  }
  async function initPixi() {
    app = new PIXI.Application();
    await app.init({
      autoDensity: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      resizeTo: window,
      hello: true,
    });
  }
}
