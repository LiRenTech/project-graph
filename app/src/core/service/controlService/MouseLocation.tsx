import { Vector } from "../../dataStruct/Vector";
import { Project, service } from "../../Project";

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
        if (this.project.controller.cutting.isUsing) {
          this.project.controller.cutting.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        if (this.project.controller.camera.isUsingMouseGrabMove) {
          this.project.controller.camera.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        if (this.project.controller.rectangleSelect.isUsing) {
          this.project.controller.rectangleSelect.mouseMoveOutWindowForcedShutdown(this.vectorObject);
        }
        this.project.controller.entityClickSelectAndMove.mouseMoveOutWindowForcedShutdown(this.vectorObject);
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
