import { Vector } from "../../../../dataStruct/Vector";
import { CopyEngine } from "../../../dataManageService/copyEngine/copyEngine";
import { ControllerClass } from "../ControllerClass";

/**
 * 关于复制相关的功能
 */
export class ControllerCopy extends ControllerClass {
  validKeys = ["ctrl", "shift", "c", "v", "x", "y", "escape", "alt"];

  mousemove = (event: MouseEvent) => {
    const worldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    // 移动时候
    if (CopyEngine.copyBoardDataRectangle) {
      // 计算鼠标位置的偏移量

      const offset = new Vector(
        worldLocation.x - CopyEngine.copyBoardDataRectangle.center.x,
        worldLocation.y - CopyEngine.copyBoardDataRectangle.center.y,
      );
      CopyEngine.copyBoardMouseVector = offset;
    }
  };
  /**
   * 2025年4月23日，用户希望鼠标左键点击就直接粘贴了。
   * @param event
   */
  mousedown = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    if (CopyEngine.copyBoardDataRectangle) {
      // 粘贴
      CopyEngine.paste();
      CopyEngine.clearVirtualCopyBoardData();
    }
  };

  keydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    // 首先判断是否是合法的按键
    if (!this.validKeys.includes(key)) return;
    if (key === "escape") {
      // 取消复制
      CopyEngine.clearVirtualCopyBoardData();
      return;
    }
    if (key === "alt") {
      // 取消复制
      CopyEngine.clearVirtualCopyBoardData();
      return;
    }
  };
}
