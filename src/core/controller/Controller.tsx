import { Color } from "../Color";
import { CircleFlameEffect } from "../effect/concrete/CircleFlameEffect";
import { ProgressNumber } from "../ProgressNumber";
import { Vector } from "../Vector";
import { Renderer } from "../render/canvas2d/renderer";
import { Stage } from "../stage/Stage";
import { TextRiseEffect } from "../effect/concrete/TextRiseEffect";
import { NodeManager } from "../NodeManager";
import { Camera } from "../stage/Camera";
import { Rectangle } from "../Rectangle";
import { LineCuttingEffect } from "../effect/concrete/LineCuttingEffect";
import { Line } from "../Line";
import { LineEffect } from "../effect/concrete/LineEffect";

export namespace Controller {
  /**
   * 在上层接收React提供的state修改函数
   */
  export let setCursorName: (_: string) => void = (_) => {};

  // 检测正在按下的键
  export const pressingKeySet: Set<string> = new Set();
  export function pressingKeysString(): string {
    let res = "";
    for (const key of pressingKeySet) {
      res += `[${key}]` + " ";
    }
    return res;
  }
  // 按键映射
  export const keyMap: { [key: string]: Vector } = {
    w: new Vector(0, -1),
    s: new Vector(0, 1),
    a: new Vector(-1, 0),
    d: new Vector(1, 0),
  };

  /**
   * 存放鼠标 左 中 右 键上次 "按下" 时候的world位置
   */
  export const lastMousePressLocation: Vector[] = [
    Vector.getZero(),
    Vector.getZero(),
    Vector.getZero(),
  ];
  export function lastMousePressLocationString(): string {
    return lastMousePressLocation.map((v) => v.toString()).join(",");
  }
  /**
   * 存放鼠标 左 中 右 键上次 "松开" 时候的world位置
   */
  const lastMouseReleaseLocation: Vector[] = [
    Vector.getZero(),
    Vector.getZero(),
    Vector.getZero(),
  ];
  export function lastMouseReleaseLocationString(): string {
    return lastMouseReleaseLocation.map((v) => v.toString()).join(",");
  }
  /**
   * 是否正在进行移动节点的操作
   */
  export let isMovingNode = false;
  /**
   * 为移动节点做准备，移动时，记录每上一帧移动的位置
   */
  export let lastMoveLocation = Vector.getZero();

  /**
   * 上次选中的节点
   * 仅为 Ctrl交叉选择使用
   */
  export let lastSelectedNode: Set<string> = new Set();

  export let touchStartLocation = Vector.getZero();
  export let touchStartDistance = 0;
  export let touchDelta = Vector.getZero();

  export let lastClickTime = 0;
  export let lastClickLocation = Vector.getZero();

  export let isMouseDown: boolean[] = [false, false, false];
  export let canvasElement: HTMLCanvasElement;

  /**
   * 悬浮提示的边缘距离
   */
  export const edgeHoverTolerance = 10;

  export function init(canvasElement: HTMLCanvasElement) {
    canvasElement = canvasElement;
    // 绑定事件
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    canvasElement.addEventListener("mousedown", mousedown);
    canvasElement.addEventListener("mousemove", mousemove);
    canvasElement.addEventListener("mouseup", mouseup);
    canvasElement.addEventListener("wheel", mousewheel);
    canvasElement.addEventListener("touchstart", touchstart, false);
    canvasElement.addEventListener("touchmove", touchmove, false);
    canvasElement.addEventListener("touchend", touchend, false);
  }

  function moveCameraByMouseMove(x: number, y: number, mouseIndex: number) {
    const currentMouseMoveLocation = Renderer.transformView2World(
      new Vector(x, y),
    );
    const diffLocation = currentMouseMoveLocation.subtract(
      lastMousePressLocation[mouseIndex],
    );
    Camera.location = Camera.location.subtract(diffLocation);
  }

  function mousedown(event: MouseEvent) {
    event.preventDefault();
    handleMousedown(event.button, event.clientX, event.clientY);
  }

  function mousemove(event: MouseEvent) {
    event.preventDefault();
    handleMousemove(event.clientX, event.clientY);
  }

  function mouseup(event: MouseEvent) {
    event.preventDefault();
    handleMouseup(event.button, event.clientX, event.clientY);
  }

  function handleMousedown(button: number, x: number, y: number) {
    isMouseDown[button] = true;
    if (
      Date.now() - lastClickTime < 200 &&
      lastClickLocation.distance(new Vector(x, y)) < 10
    ) {
      handleDblclick(button, x, y);
    }
    lastClickTime = Date.now();
    lastClickLocation = new Vector(x, y);

    const pressWorldLocation = Renderer.transformView2World(new Vector(x, y));
    const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);

    // 获取左右中键
    lastMousePressLocation[button] = pressWorldLocation;
    if (button === 0) {
      if (pressingKeySet.has("`")) {
        lastMoveLocation = pressWorldLocation.clone();
        return;
      }
      /**
       * 可能的4种情况
       *  ------------ | 已有节点被选择 | 没有节点被选择
       *  在空白地方按下 |      A       |      B
       *  在节点身上按下 |    C1,C2     |      D
       *  ------------ |  ------------ |  ------------
       * A：取消选择那些节点，可能要重新开始框选
       * B：可能是想开始框选
       * C：
       *    C1: 如果点击的节点属于被上次选中的节点中，那么整体移动，（如果还按下了Alt键，开始整体复制）
       *    C2: 如果点击的节点不属于被上次选中的节点中，那么单击选择，并取消上一次框选的所有节点
       * D：只想单击这一个节点，或者按下Alt键的时候，想复制这个节点
       *
       * 更新被选中的节点，如果没有选中节点就开始框选
       */
      const isHaveNodeSelected = NodeManager.nodes.some(
        (node) => node.isSelected,
      );
      // 左键按下
      if (clickedNode === null) {
        if (isHaveNodeSelected) {
          // A
          if (pressingKeySet.has("shift") || pressingKeySet.has("control")) {
            // 不取消选择
          } else {
            // 取消选择所有节点
            NodeManager.nodes.forEach((node) => {
              node.isSelected = false;
            });
          }
        } else {
          // B
        }
        Stage.isSelecting = true;
        Stage.selectStartLocation = pressWorldLocation.clone();
        Stage.selectEndLocation = pressWorldLocation.clone();
        Stage.selectingRectangle = new Rectangle(
          pressWorldLocation.clone(),
          Vector.getZero(),
        );
      } else {
        if (isHaveNodeSelected) {
          // C

          if (clickedNode.isSelected) {
            // C1
          } else {
            // C2
            NodeManager.nodes.forEach((node) => {
              node.isSelected = false;
            });
          }
          clickedNode.isSelected = true;
          isMovingNode = true;
        } else {
          // D
          clickedNode.isSelected = true;
          isMovingNode = true;
        }
      }
    } else if (button === 1) {
      // 中键按下
    } else if (button === 2) {
      // 右键按下
      if (clickedNode === null) {
        // 开始绘制切断线
        Stage.isCutting = true;
      } else {
        // 连接线
        Stage.isCutting = false;
        // [node for node in NodeManager.nodes if node.isSelected]
        Stage.connectFromNodes = [];
        for (const node of NodeManager.nodes) {
          if (node.isSelected) {
            Stage.connectFromNodes.push(node);
          }
        }
        if (Stage.connectFromNodes.includes(clickedNode)) {
          // 多重连接
          for (const node of NodeManager.nodes) {
            if (node.isSelected) {
              // 特效
            }
          }
        } else {
          // 不触发多重连接
          Stage.connectFromNodes = [clickedNode];
          // 特效
        }
      }
    }
    lastMoveLocation = pressWorldLocation.clone();

    // Stage.effects.push(
    //   new TextRiseEffect(
    //     `鼠标按下 ${button === 0 ? "左键" : button === 1 ? "中键" : "右键"}`,
    //   ),
    // );
  }

  function handleMousemove(x: number, y: number) {
    const worldLocation = Renderer.transformView2World(new Vector(x, y));
    // 如果当前有按下空格
    if (pressingKeySet.has(" ") && isMouseDown[0]) {
      console.log("空格按下的同时按下了鼠标左键");
      moveCameraByMouseMove(x, y, 0);
      setCursorName("grabbing");
      return;
    }

    if (isMouseDown[0]) {
      if (pressingKeySet.has("`")) {
        // 绘制临时激光笔特效
        Stage.effects.push(
          new LineEffect(
            new ProgressNumber(0, 50),
            lastMoveLocation,
            worldLocation,
            new Color(255, 255, 0, 1),
            new Color(255, 255, 0, 1),
            2,
          ),
        );
      }
      // 左键按下
      if (Stage.isSelecting) {
        // 正在框选
        Stage.selectEndLocation = worldLocation.clone();

        if (Stage.selectingRectangle) {
          Stage.selectingRectangle = Rectangle.fromTwoPoints(
            Stage.selectStartLocation,
            Stage.selectEndLocation,
          );

          if (pressingKeySet.has("shift") || pressingKeySet.has("control")) {
            // 移动过程中不先暴力清除
          } else {
            // 先清空所有已经选择了的
            NodeManager.nodes.forEach((node) => {
              node.isSelected = false;
            });
          }

          if (pressingKeySet.has("control")) {
            // 交叉选择，没的变有，有的变没
            for (const node of NodeManager.nodes) {
              if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
                if (lastSelectedNode.has(node.uuid)) {
                  node.isSelected = false;
                } else {
                  node.isSelected = true;
                }
              }
            }
          } else {
            for (const node of NodeManager.nodes) {
              if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
                node.isSelected = true;
              }
            }
          }
        }
        isMovingNode = false;
      } else {
        // 非框选
        const diffLocation = worldLocation.subtract(lastMoveLocation);
        isMovingNode = true;
        if (pressingKeySet.has("alt")) {
        } else {
          if (pressingKeySet.has("control")) {
          } else {
            console.log(diffLocation.toString());
            NodeManager.moveNodes(diffLocation);
          }
        }
      }
      lastMoveLocation = worldLocation.clone();
    } else if (isMouseDown[1]) {
      // 中键按下
      moveCameraByMouseMove(x, y, 1);
      setCursorName("grabbing");
      return;
    } else if (isMouseDown[2]) {
      // 右键按下
      lastMoveLocation = worldLocation.clone();
      if (Stage.isCutting) {
        // 正在切断线
        Stage.cuttingLine = new Line(
          lastMousePressLocation[2],
          lastMoveLocation,
        );
        Stage.warningNodes = [];
        for (const node of NodeManager.nodes) {
          if (node.rectangle.isCollideWithLine(Stage.cuttingLine)) {
            Stage.warningNodes.push(node);
          }
        }
        Stage.warningEdges = [];
        for (const edge of NodeManager.edges) {
          if (edge.bodyLine.isIntersecting(Stage.cuttingLine)) {
            Stage.warningEdges.push(edge);
          }
        }
      } else {
        // 连接线
        let isFindConnectToNode = false;
        for (const node of NodeManager.nodes) {
          if (node.rectangle.isPointInside(worldLocation)) {
            Stage.connectToNode = node;
            isFindConnectToNode = true;
            break;
          }
        }
        if (!isFindConnectToNode) {
          Stage.connectToNode = null;
        }
      }
    } else {
      // 什么都没有按下的情况
      // 看看鼠标当前的位置是否和线接近
      Stage.hoverEdges = [];
      for (const edge of NodeManager.edges) {
        if (edge.bodyLine.isPointNearLine(worldLocation, edgeHoverTolerance)) {
          Stage.hoverEdges.push(edge);
        }
      }
    }
    if (pressingKeySet.has("`")) {
      // 迭代笔位置
      lastMoveLocation = worldLocation.clone();
    }

    // setCursorName("default");
  }

  function handleMouseup(button: number, x: number, y: number) {
    isMouseDown[button] = false;
    // 记录松开位置
    lastMouseReleaseLocation[button] = Renderer.transformView2World(
      new Vector(x, y),
    );

    if (isMovingNode) {
      NodeManager.moveNodeFinished();
      isMovingNode = false;
    }
    // Stage.hoverEdges = [];

    if (button === 0) {
      // 左键松开
      Stage.isSelecting = false;
      // 将所有选择到的增加到上次选择的节点中
      lastSelectedNode = new Set();
      for (const node of NodeManager.nodes) {
        if (node.isSelected) {
          lastSelectedNode.add(node.uuid);
        }
      }
    } else if (button === 1) {
      // 中键松开
      setCursorName("default");
    } else if (button === 2) {
      // 右键松开

      // 结束连线
      if (Stage.connectFromNodes.length > 0 && Stage.connectToNode !== null) {
        let isHaveConnectResult = false; // 在多重链接的情况下，是否有连接成功
        for (const node of Stage.connectFromNodes) {
          const connectResult = NodeManager.connectNode(
            node,
            Stage.connectToNode,
          );
          if (connectResult) {
            // 连接成功，特效
            isHaveConnectResult = true;
            Stage.effects.push(
              new CircleFlameEffect(
                new ProgressNumber(0, 15),
                node.rectangle.center,
                80,
                new Color(83, 175, 29, 1),
              ),
            );
            Stage.effects.push(
              new LineCuttingEffect(
                new ProgressNumber(0, 30),
                node.rectangle.center,
                Stage.connectToNode.rectangle.center,
                new Color(78, 201, 176, 1),
                new Color(83, 175, 29, 1),
                20,
              ),
            );
          }
        }
        if (isHaveConnectResult) {
          // 给连向的那个节点加特效
          Stage.effects.push(
            new CircleFlameEffect(
              new ProgressNumber(0, 15),
              Stage.connectToNode.rectangle.center,
              80,
              new Color(0, 255, 0, 1),
            ),
          );
        }
      }
      Stage.connectFromNodes = [];
      Stage.connectToNode = null;

      if (Stage.isCutting) {
        NodeManager.deleteNodes(Stage.warningNodes);
        Stage.warningNodes = [];

        for (const edge of Stage.warningEdges) {
          NodeManager.deleteEdge(edge);
          // 计算线段的中点
          const midLocation = edge.bodyLine.midPoint();
          // 特效
          Stage.effects.push(
            new LineCuttingEffect(
              new ProgressNumber(0, 15),
              midLocation,
              edge.bodyLine.start,
              new Color(255, 0, 0, 0),
              new Color(255, 0, 0, 1),
              20,
            ),
          );
          Stage.effects.push(
            new LineCuttingEffect(
              new ProgressNumber(0, 15),
              midLocation,
              edge.bodyLine.end,
              new Color(255, 0, 0, 0),
              new Color(255, 0, 0, 1),
              20,
            ),
          );
          Stage.effects.push(
            new CircleFlameEffect(
              new ProgressNumber(0, 15),
              edge.bodyLine.midPoint(),
              50,
              new Color(255, 0, 0, 1),
            ),
          );
        }
        NodeManager.updateReferences();

        Stage.warningEdges = [];

        Stage.effects.push(
          new LineCuttingEffect(
            new ProgressNumber(0, 15),
            lastMousePressLocation[2],
            lastMouseReleaseLocation[2],
            new Color(255, 255, 0, 0),
            new Color(255, 255, 0, 1),
            lastMousePressLocation[2].distance(lastMouseReleaseLocation[2]) /
              10,
          ),
        );
      }
    }

    if (Stage.isCutting) {
      // 结束切断线
      Stage.isCutting = false;
    }
    // Stage.effects.push(new TextRiseEffect("mouse up"));
  }

  function mousewheel(e: WheelEvent) {
    if (pressingKeySet.has("control")) {
      const location = Renderer.transformView2World(
        new Vector(e.clientX, e.clientY),
      );
      const hoverNode = NodeManager.findNodeByLocation(location);
      if (hoverNode !== null) {
        // 旋转节点
        if (e.deltaY > 0) {
          NodeManager.rotateNode(hoverNode, 10);
        } else {
          NodeManager.rotateNode(hoverNode, -10);
        }
      }
    } else {
      if (e.deltaY > 0) {
        Camera.targetScale *= 0.8;
      } else {
        Camera.targetScale *= 1.2;
      }
    }
  }

  function handleDblclick(button: number, x: number, y: number) {
    const pressLocation = Renderer.transformView2World(new Vector(x, y));
    let clickedNode = NodeManager.findNodeByLocation(pressLocation);
    // 如果是左键
    if (button === 0) {
      if (Stage.hoverEdges.length > 0) {
        // 编辑边上的文字
        let user_input = prompt("请输入线上的文字", Stage.hoverEdges[0].text);
        if (user_input) {
          for (const edge of Stage.hoverEdges) { 
            NodeManager.renameEdge(edge, user_input);
          }
        }
        return;
      }
      for (const node of NodeManager.nodes) {
        if (node.rectangle.isPointInside(pressLocation)) {
          Stage.effects.push(new TextRiseEffect("Node clicked: " + node.uuid));
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
          Renderer.transformView2World(new Vector(x, y)),
        );
        Stage.effects.push(
          new CircleFlameEffect(
            new ProgressNumber(0, 40),
            Renderer.transformView2World(new Vector(x, y)),
            100,
            new Color(0, 255, 0, 1),
          ),
        );
      }
    } else if (button === 1) {
      // 中键双击
      Camera.reset();
    }
  }

  function keydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    pressingKeySet.add(key);
    if (keyMap[key]) {
      // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
      Camera.accelerateCommander = Camera.accelerateCommander
        .add(keyMap[key])
        .limitX(-1, 1)
        .limitY(-1, 1);
    }
    if (key === " ") {
      setCursorName("grab");
    } else if (key === "delete") {
      NodeManager.deleteNodes(
        NodeManager.nodes.filter((node) => node.isSelected),
      );
    } else if (key === "enter") {
      // 开始编辑选中的连线
    }
  }

  function keyup(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!pressingKeySet.has(key)) {
      // FIXME: 但这里有个问题，在按下 ctrl+alt+a 时，会显示画面一直往右走。原因是按下a没有被检测到，但抬起a被检测到了
      // 所以松开某个移动的按键时，还要检测之前是否已经按下了这个按键
      return;
    } else {
      pressingKeySet.delete(key);
    }
    if (keyMap[key]) {
      // 当松开某一个方向的时候,相当于停止加速度
      Camera.accelerateCommander = Camera.accelerateCommander
        .subtract(keyMap[key])
        .limitX(-1, 1)
        .limitY(-1, 1);
    }
    setCursorName("default");
  }

  function touchstart(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      handleMousedown(0, e.touches[0].clientX, e.touches[0].clientY);
    }
    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      touchStartLocation = center;

      // 计算初始两指间距离
      touchStartDistance = touch1.distance(touch2);
    }
  }

  function touchmove(e: TouchEvent) {
    e.preventDefault();

    if (e.touches.length === 1) {
      handleMousemove(e.touches[0].clientX, e.touches[0].clientY);
    }
    if (e.touches.length === 2) {
      const touch1 = Vector.fromTouch(e.touches[0]);
      const touch2 = Vector.fromTouch(e.touches[1]);
      const center = Vector.average(touch1, touch2);
      touchDelta = center.subtract(touchStartLocation);

      // 计算当前两指间的距离
      const currentDistance = touch1.distance(touch2);
      const scaleRatio = currentDistance / touchStartDistance;

      // 缩放画面
      Camera.targetScale *= scaleRatio;
      touchStartDistance = currentDistance; // 更新距离

      // 更新中心点位置
      touchStartLocation = center;

      // 移动画面
      Camera.location = Camera.location.subtract(
        touchDelta.multiply(1 / Camera.currentScale),
      );
    }
  }

  function touchend(e: TouchEvent) {
    e.preventDefault();
    if (e.changedTouches.length === 1) {
      handleMouseup(
        0,
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
      );
    }
    // 移动画面
    Camera.accelerateCommander = touchDelta
      .multiply(-1)
      .multiply(Camera.currentScale)
      .limitX(-1, 1)
      .limitY(-1, 1);
    touchDelta = Vector.getZero();
    setTimeout(() => {
      Camera.accelerateCommander = Vector.getZero();
    }, 100);
  }

  export function destroy() {
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    canvasElement?.removeEventListener("mousedown", mousedown);
    canvasElement?.removeEventListener("mousemove", mousemove);
    canvasElement?.removeEventListener("mouseup", mouseup);
    canvasElement?.removeEventListener("wheel", mousewheel);
    canvasElement?.removeEventListener("touchstart", touchstart);
    canvasElement?.removeEventListener("touchmove", touchmove);
    canvasElement?.removeEventListener("touchend", touchend);
    console.log("Controller destroyed.");
  }
}
