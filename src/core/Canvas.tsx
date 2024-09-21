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
    await initViewport();
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
  async function initViewport() {
    view = new Viewport({
      worldWidth: VIEW_RECT.width,
      worldHeight: VIEW_RECT.height,
      events: app.renderer.events,
    });
    view.drag().pinch().wheel().animate({
      time: 1000,
      ease: "easeInOut",
    });
    view.moveCenter(VIEW_CENTER);
    app.stage.addChild(view);
    view.addChild(new PIXI.Graphics().rect(0, 0, 100, 100).fill(0xff0000));
  }
  function world2view(point: PIXI.Point) {
    return view.toLocal(point, view.parent);
  }
}
