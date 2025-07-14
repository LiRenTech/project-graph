import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { isMac } from "../../../../../utils/platform";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../../stage/stageObject/entity/ImageNode";
import { SvgNode } from "../../../../stage/stageObject/entity/SvgNode";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

export const ControllerImageScale = new ControllerClass();

ControllerImageScale.mousewheel = (event: WheelEvent) => {
  if (isMac ? Controller.pressingKeySet.has("meta") : Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const hoverEntity = StageManager.findEntityByLocation(location);
    if (hoverEntity === null) {
      return;
    }
    if (hoverEntity instanceof ImageNode || hoverEntity instanceof SvgNode) {
      // 需要注意缩放逻辑和视野缩放逻辑保持一致性
      for (const entity of StageManager.getSelectedEntities()) {
        if (entity instanceof ImageNode || entity instanceof SvgNode) {
          if (event.deltaY > 0) {
            // 放大图片
            entity.scaleUpdate(-0.1);
          } else if (event.deltaY < 0) {
            entity.scaleUpdate(+0.1);
          }
        }
      }
    }
  }
};
