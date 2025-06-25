import { Vector } from "../../../../dataStruct/Vector";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { ControllerClass } from "../ControllerClass";

export class ControllerChildCamera extends ControllerClass {
  private targetPortalNode: PortalNode | null = null;
  // private isMoving: boolean = false;
  // 开始按下的世界坐标
  private currentWorldLocation = new Vector(0, 0);

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (!event.ctrlKey) {
      return;
    }
    if (event.button === 1) {
      // 中键按下
      const location = new Vector(event.clientX, event.clientY);
      const pressWorldLocation = this.project.renderer.transformView2World(location);
      for (const entity of StageManager.getEntities()) {
        if (entity instanceof PortalNode) {
          if (entity.collisionBox.isContainsPoint(pressWorldLocation)) {
            // 开始移动子摄像机
            this.targetPortalNode = entity;
            this.currentWorldLocation = pressWorldLocation;
            break;
          }
        }
      }
    }
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (!event.ctrlKey) {
      return;
    }
    // if (event.button !== 1) {
    //   return;
    // }
    if (this.targetPortalNode) {
      const location = new Vector(event.clientX, event.clientY);
      const moveWorldLocation = this.project.renderer.transformView2World(location);
      const delta = moveWorldLocation.subtract(this.currentWorldLocation);
      this.targetPortalNode.moveTargetLocation(delta.multiply(-1)); // 此处必须是反着的,否则很奇怪
      // this.isMoving = true;
      this.currentWorldLocation = moveWorldLocation;
    }
  };

  public mouseup: (event: MouseEvent) => void = (event) => {
    if (event.button === 1) {
      this.targetPortalNode = null;
      // this.isMoving = false;
    }
  };

  public mouseDoubleClick: (event: MouseEvent) => void = (event) => {
    if (!event.ctrlKey) {
      return;
    }
    if (event.button === 1) {
      const location = new Vector(event.clientX, event.clientY);
      const pressWorldLocation = this.project.renderer.transformView2World(location);
      for (const entity of StageManager.getEntities()) {
        if (entity instanceof PortalNode) {
          if (entity.collisionBox.isContainsPoint(pressWorldLocation)) {
            // 双击将此摄像机位置重置
            entity.moveToTargetLocation(Vector.getZero());
            break;
          }
        }
      }
    }
  };

  public mousewheel: (event: WheelEvent) => void = (event) => {
    if (!event.ctrlKey) {
      return;
    }
    const location = new Vector(event.clientX, event.clientY);
    const pressWorldLocation = this.project.renderer.transformView2World(location);
    const portalNodes: PortalNode[] = StageManager.getEntities().filter(
      (entity) => entity instanceof PortalNode && entity.collisionBox.isContainsPoint(pressWorldLocation),
    ) as PortalNode[];
    if (event.altKey) {
      // 按住alt键时, 缩放摄像机
      portalNodes.forEach((portalNode) => {
        if (event.deltaY > 0) {
          portalNode.zoomIn();
        } else {
          portalNode.zoomOut();
        }
      });
      return;
    }

    if (event.deltaY > 0) {
      // 向上滚动
      for (const portalNode of portalNodes) {
        portalNode.expand();
      }
    } else if (event.deltaY < 0) {
      // 向下滚动
      for (const portalNode of portalNodes) {
        portalNode.shrink();
      }
    }
  };
}
