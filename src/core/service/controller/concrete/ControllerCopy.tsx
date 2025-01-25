import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { CopyEngine } from "../../copyEngine/copyEngine";

/**
 * 关于复制相关的功能
 */
export const ControllerCopy = new ControllerClass();

const validKeys = ["ctrl", "shift", "c", "v", "x", "y", "escape"];

ControllerCopy.mousemove = (event: MouseEvent) => {
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

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
ControllerCopy.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;
  if (key === "escape") {
    // 取消复制
    CopyEngine.clearCopyBoardData();
    return;
  }
  if (key === "c" && Controller.pressingKeySet.has("control")) {
    CopyEngine.copy();
  } else if (key === "v" && Controller.pressingKeySet.has("control")) {
    // 粘贴
    if (Controller.pressingKeySet.has("shift")) {
      CopyEngine.pasteWithOriginLocation();
    } else {
      console.log("paste");
      CopyEngine.paste();
    }
  }
};
