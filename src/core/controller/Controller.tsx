import Color from "../Color";
import CircleFlameEffect from "../effect/concrete/circleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Render } from "../render/canvas2d/render";
import { Stage } from "../stage/Stage";

export class Controller {
  private boundMousedown: (e: MouseEvent) => void;
  private boundKeydown: (e: KeyboardEvent) => void;
  private boundKeyup: (e: KeyboardEvent) => void;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public stage: Stage,
    public render: Render,
  ) {
    // 初始化赋值
    this.boundMousedown = this.mousedown.bind(this);
    this.boundKeydown = this.keydown.bind(this);
    this.boundKeyup = this.keyup.bind(this);

    // 绑定事件
    this.canvasElement.addEventListener("mousedown", this.boundMousedown);
    window.addEventListener("keydown", this.boundKeydown);
    window.addEventListener("keyup", this.boundKeyup);
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

  keyup(e: KeyboardEvent) {
    console.log(e.key);
  }

  destroy() {
    this.canvasElement.removeEventListener("mousedown", this.boundMousedown);
    window.removeEventListener("keydown", this.boundKeydown);
    window.removeEventListener("keyup", this.boundKeyup);
    console.log("Controller destroyed.");
  }
}
