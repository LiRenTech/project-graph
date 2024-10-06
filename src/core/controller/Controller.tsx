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
// import { LineCuttingEffect } from "../effect/concrete/LineCuttingEffect";
// import { Line } from "../Line";
import { LineEffect } from "../effect/concrete/LineEffect";
import { ControllerCamera } from "./concrete/ControllerCamera";
import { ControllerNodeRotation } from "./concrete/ControllerNodeRotation";
import { ControllerNodeConnection } from "./concrete/ControllerNodeConnection";
import { ControllerCutting } from "./concrete/ControllerCutting";

/**
 * 控制器，控制鼠标、键盘事件
 * 
 * 想到一个点子：把每隔功能都功能拆成 mouse down,move,up 三个函数，
 * 然后再统一集成到这里。
 */
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
   * 是否正在进行移动(拖拽旋转)连线的操作
   */
  export let isMovingEdge = false;
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

  /**
   * 初始化函数在页面挂在的时候调用
   * @param canvasElement 
   */
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
    ControllerCamera.init(canvasElement);
    ControllerNodeRotation.init(canvasElement);
    ControllerNodeConnection.init(canvasElement);
    ControllerCutting.init(canvasElement);
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

    const pressWorldLocation = Renderer.transformView2World(new Vector(x, y));
    const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);
    const clickedEdge = NodeManager.findEdgeByLocation(pressWorldLocation);

    // 获取左右中键
    lastMousePressLocation[button] = pressWorldLocation;
    if (button === 0) {
      if (pressingKeySet.has("`")) {
        lastMoveLocation = pressWorldLocation.clone();
        return;
      }
      /**
       * 可能的情况
       *  ------------ | 已有对象被选择 | 没有对象被选择
       *  在空白地方按下 |      A       |      B
       *  在节点身上按下 |    C1,C2     |      D
       *  在连线身上按下 |    E1,E2     |      F
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
      // const isHaveEdgeSelected = NodeManager.edges.some(
      //   (edge) => edge.isSelected,
      // );
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
      if (clickedEdge === null) {
        // 和A一样了
        console.log("没有连线被按下");
      } else {
        // 在连线身上按下
        Stage.isSelecting = false;
      }
    } else if (button === 1) {
      // 中键按下
    } else if (button === 2) {
      // 右键按下
    }
    lastMoveLocation = pressWorldLocation.clone();

  }

  function handleMousemove(x: number, y: number) {
    const worldLocation = Renderer.transformView2World(new Vector(x, y));

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
        isMovingEdge = false;
      } else {
        // 非框选，要么是在移动节点，要么是在移动连线
        // 判断依据就是是否有选中的节点
        const diffLocation = worldLocation.subtract(lastMoveLocation);

        if (NodeManager.nodes.some((node) => node.isSelected)) {
          // 移动节点
          isMovingNode = true;
          if (pressingKeySet.has("alt")) {
          } else {
            if (pressingKeySet.has("control")) {
            } else {
              NodeManager.moveNodes(diffLocation);
            }
          }
        }
      }
      lastMoveLocation = worldLocation.clone();
    } else if (isMouseDown[2]) {
      // 右键按下
      lastMoveLocation = worldLocation.clone();
      if (Stage.isCutting) {

      } else {
        
      }
    }
    if (pressingKeySet.has("`")) {
      // 迭代笔位置
      lastMoveLocation = worldLocation.clone();
    }
  }

  function handleMouseup(button: number, x: number, y: number) {
    isMouseDown[button] = false;
    if (
      Date.now() - lastClickTime < 200 &&
      lastClickLocation.distance(new Vector(x, y)) < 10
    ) {
      handleDblclick(button, x, y);
    }
    lastClickTime = Date.now();
    lastClickLocation = new Vector(x, y);
    // 记录松开位置
    lastMouseReleaseLocation[button] = Renderer.transformView2World(
      new Vector(x, y),
    );

    if (isMovingNode) {
      NodeManager.moveNodeFinished();
      isMovingNode = false;
    }

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
    } else if (button === 2) {
      // 右键松开

      if (Stage.isCutting) {

      }
    }

    if (Stage.isCutting) {
      // 结束切断线
      Stage.isCutting = false;
    }
  }

  function mousewheel(_: WheelEvent) {
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
            edge.rename(user_input);
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
        clickedNode.isEditing = true;
        Renderer.input(
          Renderer.transformWorld2View(clickedNode.rectangle.location).add(
            Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
          ),
          clickedNode.text,
          (text) => {
            clickedNode?.rename(text);
          },
          {
            fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
            backgroundColor: "transparent",
            color: "white",
            outline: "none",
            marginTop: -8 * Camera.currentScale + "px",
            width: "100vw",
          },
        ).then(() => {
          clickedNode!.isEditing = false;
        });
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
    }
  }

  function keydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    pressingKeySet.add(key);
    if (key === "s" && pressingKeySet.has("control")) {
      // 保存
      console.log("Save");
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
      return;
    } else {
      pressingKeySet.delete(key);
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
    ControllerCamera.destroy(canvasElement!);
    ControllerNodeRotation.destroy(canvasElement!);
    ControllerNodeConnection.destroy(canvasElement!);
    ControllerCutting.destroy(canvasElement!);
    console.log("Controller destroyed.");
  }
}
