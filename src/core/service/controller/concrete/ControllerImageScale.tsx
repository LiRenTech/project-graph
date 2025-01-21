import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

export const ControllerImageScale = new ControllerClass();

ControllerImageScale.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    const hoverImageNode = StageManager.findImageNodeByLocation(location);
    if (hoverImageNode === null) {
      return;
    }
    if (event.deltaY > 0) {
      // 放大图片
      hoverImageNode.scaleUpdate(+0.1);
    } else if (event.deltaY < 0) {
      hoverImageNode.scaleUpdate(-0.1);
    }
  }
};
