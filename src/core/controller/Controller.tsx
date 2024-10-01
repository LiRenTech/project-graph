import { Color } from "../Color";
import { CircleFlameEffect } from "../effect/concrete/circleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Renderer } from "../render/canvas2d/renderer";
import { Stage } from "../stage/Stage";
import { TextRiseEffect } from "../effect/concrete/textRiseEffect";
import { NodeManager } from "../NodeManager";
import { Camera } from "../stage/Camera";
import { Node } from "../Node";

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
  private touchStartLocation = Vector.getZero();
  private touchStartDistance = 0;
  private touchDelta = Vector.getZero();

  private isMouseDown: boolean = false;

  constructor(public canvasElement: HTMLCanvasElement) {
    // 绑定事件
    window.addEventListener("keydown", this.keydown.bind(this));
    window.addEventListener("keyup", this.keyup.bind(this));
    this.canvasElement.addEventListener("mousedown", this.mousedown.bind(this));
    this.canvasElement.addEventListener("mousemove", this.mousemove.bind(this));
    this.canvasElement.addEventListener("mouseup", this.mouseup.bind(this));
    this.canvasElement.addEventListener("wheel", this.mousewheel.bind(this));
    this.canvasElement.addEventListener("dblclick", this.dblclick.bind(this));
    this.canvasElement.addEventListener(
      "touchstart",
      this.touchstart.bind(this),
    );
    this.canvasElement.addEventListener("touchmove", this.touchmove.bind(this));
    this.canvasElement.addEventListener("touchend", this.touchend.bind(this));
  }

  mousedown(e: MouseEvent) {
    // 阻止默认行为，防止右键菜单弹出
    e.preventDefault();

    this.isMouseDown = true;

    const pressLocation = Renderer.transformView2World(
      new Vector(e.clientX, e.clientY),
    );

    // 获取左右中键
    const button = e.button;
    if (button === 0) {
      // 左键按下
      for (const node of NodeManager.nodes) {
        if (node.rectangle.isPointInside(pressLocation)) {
          Stage.effects.push(new TextRiseEffect("按到了节点"));
          break;
        }
      }
    } else if (button === 1) {
      // 中键按下
    } else if (button === 2) {
      // 右键按下
    }

    // Stage.effects.push(
    //   new TextRiseEffect(
    //     `鼠标按下 ${button === 0 ? "左键" : button === 1 ? "中键" : "右键"}`,
    //   ),
    // );
    Stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        Renderer.transformView2World(new Vector(e.clientX, e.clientY)),
        50,
        new Color(255, 0, 0, 1),
      ),
    );
  }

  mousemove(e: MouseEvent) {
    if (this.isMouseDown) {
      Stage.effects.push(
        new CircleFlameEffect(
          new ProgressNumber(0, 5),
          Renderer.transformView2World(new Vector(e.clientX, e.clientY)),
          30,
          new Color(141, 198, 229, 1),
        ),
      );
    }
  }

  mouseup(e: MouseEvent) {
    // 阻止默认行为
    e.preventDefault();
    this.isMouseDown = false;
    Stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        Renderer.transformView2World(new Vector(e.clientX, e.clientY)),
        50,
        new Color(0, 0, 255, 1),
      ),
    );
    // Stage.effects.push(new TextRiseEffect("mouse up"));
  }

  mousewheel(e: WheelEvent) {
    if (e.deltaY > 0) {
      Camera.targetScale *= 0.8;
    } else {
      Camera.targetScale *= 1.2;
    }
  }

  dblclick(e: MouseEvent) {
    const pressLocation = Renderer.transformView2World(
      new Vector(e.clientX, e.clientY),
    );
    // 如果是左键
    if (e.button === 0) {
      let isHasNode = false;
      let clickedNode: Node | null = null;
      for (const node of NodeManager.nodes) {
        if (node.rectangle.isPointInside(pressLocation)) {
          Stage.effects.push(new TextRiseEffect("Node clicked: " + node.uuid));
          isHasNode = true;
          clickedNode = node;
          break;
        }
      }

      if (clickedNode !== null) {
        // 编辑节点
        let user_input = prompt("请输入节点名称", clickedNode.text);
        if (user_input) {
          NodeManager.renameNode(clickedNode, user_input);
        }
      } else {
        // 新建节点
        NodeManager.addNodeByClick(
          Renderer.transformView2World(new Vector(e.clientX, e.clientY)),
        );
      }
    }
    Stage.effects.push(
      new CircleFlameEffect(
        new ProgressNumber(0, 40),
        Renderer.transformView2World(new Vector(e.clientX, e.clientY)),
        100,
        new Color(0, 255, 0, 1),
      ),
    );
  }

  keydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.pressingKeySet.add(key);
    if (this.keyMap[key]) {
      // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
      Camera.accelerateCommander = Camera.accelerateCommander
        .add(this.keyMap[key])
        .limitX(-1, 1)
        .limitY(-1, 1);
    }
  }

  keyup(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!this.pressingKeySet.has(key)) {
      // FIXME: 但这里有个问题，在按下 ctrl+alt+a 时，会显示画面一直往右走。原因是按下a没有被检测到，但抬起a被检测到了
      // 所以松开某个移动的按键时，还要检测之前是否已经按下了这个按键
      return;
    } else {
      this.pressingKeySet.delete(key);
    }
    if (this.keyMap[key]) {
      // 当松开某一个方向的时候,相当于停止加速度
      Camera.accelerateCommander = Camera.accelerateCommander
        .subtract(this.keyMap[key])
        .limitX(-1, 1)
        .limitY(-1, 1);
    }
  }

  touchstart(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      this.touchStartLocation = center;

      // 计算初始两指间距离
      this.touchStartDistance = touch1.distance(touch2);
    }
  }

  touchmove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      this.touchDelta = center.subtract(this.touchStartLocation);

      // 计算当前两指间的距离
      const currentDistance = touch1.distance(touch2);
      const scaleRatio = currentDistance / this.touchStartDistance;

      // 缩放画面
      Camera.targetScale *= scaleRatio;
      this.touchStartDistance = currentDistance; // 更新距离

      // 更新中心点位置
      this.touchStartLocation = center;

      // 移动画面
      Camera.location = Camera.location.subtract(
        this.touchDelta.multiply(1 / Camera.currentScale),
      );
    }
  }

  touchend(e: TouchEvent) {
    e.preventDefault();
    // 移动画面
    Camera.accelerateCommander = this.touchDelta
      .multiply(-1)
      .multiply(Camera.currentScale)
      .limitX(-1, 1)
      .limitY(-1, 1);
    this.touchDelta = Vector.getZero();
    setTimeout(() => {
      Camera.accelerateCommander = Vector.getZero();
    }, 100);
  }

  destroy() {
    console.log("Controller destroyed.");
  }
}
