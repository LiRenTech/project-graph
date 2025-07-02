import { Vector } from "../../dataStruct/Vector";

export namespace MouseLocation {
  export let x: number = 0;
  export let y: number = 0;

  export function init() {
    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;

      // this.project.controller.recordManipulate();
      // 检测是否超出范围
      // TODO: 这里还可以优化一下，给每个Controller都加一个mouseMoveOutWindowForcedShutdown方法
      // if (this.x < 0 || this.x > window.innerWidth || this.y < 0 || this.y > window.innerHeight) {
      //   if (this.project.controller.cutting.isUsing) {
      //     this.project.controller.cutting.mouseMoveOutWindowForcedShutdown(this.vectorObject);
      //   }
      //   if (this.project.controller.camera.isUsingMouseGrabMove) {
      //     this.project.controller.camera.mouseMoveOutWindowForcedShutdown(this.vectorObject);
      //   }
      //   if (this.project.controller.rectangleSelect.isUsing) {
      //     this.project.controller.rectangleSelect.mouseMoveOutWindowForcedShutdown(this.vectorObject);
      //   }
      //   this.project.controller.entityClickSelectAndMove.mouseMoveOutWindowForcedShutdown(this.vectorObject);
      // }
    });
  }

  /**
   * 返回的时视野坐标系中的鼠标位置
   * 注意是view坐标系
   * @returns
   */
  export function vector(): Vector {
    return new Vector(x, y);
  }
}
