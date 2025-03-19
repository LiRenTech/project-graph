import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../../stage/stageObject/entity/ImageNode";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

export const ControllerImageScale = new ControllerClass();

ControllerImageScale.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const hoverImageNode = StageManager.findImageNodeByLocation(location);
    if (hoverImageNode === null) {
      return;
    }
    // 需要注意缩放逻辑和视野缩放逻辑保持一致性
    for (const imageNode of StageManager.getSelectedEntities().filter((entity) => entity instanceof ImageNode)) {
      if (event.deltaY > 0) {
        // 放大图片
        imageNode.scaleUpdate(-0.1);
      } else if (event.deltaY < 0) {
        imageNode.scaleUpdate(+0.1);
      }
    }
  }
};
