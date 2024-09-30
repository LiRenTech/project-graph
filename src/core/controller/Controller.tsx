import Color from "../Color";
import CircleFlameEffect from "../effect/concrete/circleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Render } from "../render/canvas2d/render";
import { Stage } from "../stage/Stage";

export class Controller {
  // 检测正在按下的键
  private pressingKeySet: Set<string> = new Set();
  // 按键映射
  private keyMap: { [key: string]: Vector } = {
    w: new Vector(0, -1),
    s: new Vector(0, 1),
    a: new Vector(-1, 0),
    d: new Vector(1, 0),
  };

  // 绑定事件
  private boundMousedown: (e: MouseEvent) => void;
  private boundKeydown: (e: KeyboardEvent) => void;
  private boundKeyup: (e: KeyboardEvent) => void;
  private boundMousewheel: (e: WheelEvent) => void;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public stage: Stage,
    public render: Render,
  ) {
    // 初始化赋值
    this.boundMousedown = this.mousedown.bind(this);
    this.boundKeydown = this.keydown.bind(this);
    this.boundKeyup = this.keyup.bind(this);
    this.boundMousewheel = this.mousewheel.bind(this);

    // 绑定事件
    this.canvasElement.addEventListener("mousedown", this.boundMousedown);
    window.addEventListener("keydown", this.boundKeydown);
    window.addEventListener("keyup", this.boundKeyup);
    this.canvasElement.addEventListener("wheel", this.boundMousewheel);
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

  mousewheel(e: WheelEvent) {
    if (e.deltaY > 0) {
      this.stage.camera.targetScale *= 0.8;
      if (this.stage.camera.targetScale < 0.1) {
        this.stage.camera.targetScale = 0.1;
      }
    } else {
      this.stage.camera.targetScale *= 1.2;
    }
  }

  keydown(event: KeyboardEvent) {
    console.log(event.key);
    const key = event.key.toLowerCase();
    this.pressingKeySet.add(key);
    if (this.keyMap[key]) {
      // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
      this.stage.camera.accelerateCommander =
        this.stage.camera.accelerateCommander
          .add(this.keyMap[key])
          .limitX(-1, 1)
          .limitY(-1, 1);
    }
  }

  keyup(event: KeyboardEvent) {
    console.log(event.key);
    const key = event.key.toLowerCase();
    if (!this.pressingKeySet.has(key)) {
      // 但这里有个问题，在按下 ctrl+alt+a 时，会显示画面一直往右走。原因是按下a没有被检测到，但抬起a被检测到了
      // 所以松开某个移动的按键时，还要检测之前是否已经按下了这个按键
      return;
    } else {
      this.pressingKeySet.delete(key);
    }
    if (this.keyMap[key]) {
      // 当松开某一个方向的时候,相当于停止加速度
      this.stage.camera.accelerateCommander =
        this.stage.camera.accelerateCommander
          .subtract(this.keyMap[key])
          .limitX(-1, 1)
          .limitY(-1, 1);
    }
  }

  destroy() {
    this.canvasElement.removeEventListener("mousedown", this.boundMousedown);
    window.removeEventListener("keydown", this.boundKeydown);
    window.removeEventListener("keyup", this.boundKeyup);
    this.canvasElement.removeEventListener("wheel", this.boundMousewheel);
    console.log("Controller destroyed.");
  }
}
