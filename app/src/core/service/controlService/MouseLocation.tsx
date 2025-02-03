import { Vector } from "../../dataStruct/Vector";

export namespace MouseLocation {
  export let x: number = 0;
  export let y: number = 0;

  export function init() {
    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;

      // 维护一个Vector对象
      vectorObject.x = x;
      vectorObject.y = y;
    });
  }

  const vectorObject = new Vector(x, y);

  /**
   * 返回的时视野坐标系中的鼠标位置
   * 注意是view坐标系
   * @returns
   */
  export function vector(): Vector {
    return vectorObject;
  }
}
