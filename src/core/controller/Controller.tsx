import Color from "../Color";
import CircleFlameEffect from "../effect/concrete/circleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Render } from "../render/canvas2d/render";
import { Stage } from "../stage/Stage";

export class Controller {
  constructor(
    public canvasElement: HTMLCanvasElement,
    public stage: Stage,
    public render: Render,
  ) {
    this.canvasElement.addEventListener("mousedown", this.mousedown.bind(this));
    // this.canvasElement.addEventListener("keydown", this.keydown.bind(this));
  }

  mousedown(e: MouseEvent) {
    console.log(e.clientX, e.clientY);
    this.stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        this.render.transformView2World(new Vector(e.clientX, e.clientY)),
        50,
        new Color(255, 0, 0, 1),
      ),
    );
  }

  keydown(e: KeyboardEvent) {
    console.log(e.key);
  }

  destroy() {
    this.canvasElement.removeEventListener(
      "mousedown",
      this.mousedown.bind(this),
    );
    // this.canvasElement.removeEventListener("keydown", this.keydown.bind(this));
  }
}
