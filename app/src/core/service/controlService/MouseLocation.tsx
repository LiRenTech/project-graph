import { Vector } from "../../dataStruct/Vector";
import { Project, service } from "../../Project";
import { Stage } from "../../stage/Stage";

@service("mouseLocation")
export class MouseLocation {
  x: number = 0;
  y: number = 0;

  constructor(private readonly project: Project) {
    window.addEventListener("mousemove", (event) => {
      this.x = event.clientX;
      this.y = event.clientY;

      // 维护一个Vector对象
      this.vectorObject.x = this.x;
      this.vectorObject.y = this.y;

      this.project.controller.recordManipulate();
      // 检测是否超出范围
      // TODO: 这里还可以优化一下，给每个Controller都加一个mouseMoveOutWindowForcedShutdown方法
      if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight) {
        if (Stage.cuttingMachine.isUsing) {
          Stage.cuttingMachine.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        if (Stage.cameraControllerMachine.isUsingMouseGrabMove) {
          Stage.cameraControllerMachine.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        if (Stage.rectangleSelectMouseMachine.isUsing) {
          Stage.rectangleSelectMouseMachine.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        Stage.entityMoveMachine.mouseMoveOutWindowForcedShutdown(this.vectorObject);
      }
    });
  }

  private readonly vectorObject = new Vector(this.x, this.y);

  /**
   * 返回的时视野坐标系中的鼠标位置
   * 注意是view坐标系
   * @returns
   */
  vector(): Vector {
    return this.vectorObject;
  }
}
