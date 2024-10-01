import Color from "../Color";
import CircleFlameEffect from "../effect/concrete/circleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Render } from "../render/canvas2d/render";
import { Stage } from "../stage/Stage";
import TextRiseEffect from "../effect/concrete/textRiseEffect";
import { NodeManager } from "../NodeManager";

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
  private boundKeydown: (e: KeyboardEvent) => void;
  private boundKeyup: (e: KeyboardEvent) => void;
  // 鼠标事件
  private boundMousedown: (e: MouseEvent) => void;
  private boundMousemove: (e: MouseEvent) => void;
  private boundMouseup: (e: MouseEvent) => void;
  private boundMousewheel: (e: WheelEvent) => void;
  private boundDblclick: (e: MouseEvent) => void;
  private isMouseDown: boolean = false;

  constructor(
    public canvasElement: HTMLCanvasElement,
    public stage: Stage,
    public render: Render,
  ) {
    // 初始化赋值
    this.boundKeydown = this.keydown.bind(this);
    this.boundKeyup = this.keyup.bind(this);
    this.boundMousedown = this.mousedown.bind(this);
    this.boundMousemove = this.mousemove.bind(this);
    this.boundMouseup = this.mouseup.bind(this);
    this.boundMousewheel = this.mousewheel.bind(this);
    this.boundDblclick = this.dblclick.bind(this);

    // 绑定事件
    window.addEventListener("keydown", this.boundKeydown);
    window.addEventListener("keyup", this.boundKeyup);
    this.canvasElement.addEventListener("mousedown", this.boundMousedown);
    this.canvasElement.addEventListener("mousemove", this.boundMousemove);
    this.canvasElement.addEventListener("mouseup", this.boundMouseup);
    this.canvasElement.addEventListener("wheel", this.boundMousewheel);
    this.canvasElement.addEventListener("dblclick", this.boundDblclick);
  }

  mousedown(e: MouseEvent) {
    // 阻止默认行为，防止右键菜单弹出
    e.preventDefault();

    this.isMouseDown = true;
    
    const pressLocation = this.render.transformView2World(
      new Vector(e.clientX, e.clientY),
    );

    // 获取左右中键
    const button = e.button;
    if (button === 0) {
      // 左键按下
      for (const node of NodeManager.nodes) {
        // TODO: Node的bodyShape应该用矩形表示，矩形有好多运算方法
      }
    } else if (button === 1) {
      // 中键按下
    } else if (button === 2) {
      // 右键按下
    }

    // this.stage.effects.push(
    //   new TextRiseEffect(
    //     `鼠标按下 ${button === 0 ? "左键" : button === 1 ? "中键" : "右键"}`,
    //   ),
    // );
    this.stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        this.render.transformView2World(new Vector(e.clientX, e.clientY)),
        50,
        new Color(255, 0, 0, 1),
      ),
    );
  }

  mousemove(e: MouseEvent) {
    if (this.isMouseDown) {
      this.stage.effects.push(
        new CircleFlameEffect(
          new ProgressNumber(0, 5),
          this.render.transformView2World(new Vector(e.clientX, e.clientY)),
          30,
          new Color(141, 198, 229, 1),
        ),
      );
    }
  }

  mouseup(e: MouseEvent) {
    // 阻止默认行为
    e.preventDefault();
    // 阻止事件冒泡
    e.stopPropagation();
    this.isMouseDown = false;
    this.stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        this.render.transformView2World(new Vector(e.clientX, e.clientY)),
        50,
        new Color(0, 0, 255, 1),
      ),
    );
    this.stage.effects.push(new TextRiseEffect("mouse up"));
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

  dblclick(e: MouseEvent) {
    // 如果是左键
    if (e.button === 0) {
      NodeManager.addNodeByClick(
        this.render.transformView2World(new Vector(e.clientX, e.clientY)),
      );
    }
    this.stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        this.render.transformView2World(new Vector(e.clientX, e.clientY)),
        100,
        new Color(0, 255, 0, 1),
      ),
    );
    this.stage.effects.push(new TextRiseEffect("mouse up"));
  }

  keydown(event: KeyboardEvent) {
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
