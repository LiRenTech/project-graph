import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Stage } from "../../stage/Stage";
import { Controller } from "../Controller";

import { ControllerClass } from "../ControllerClass";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerCurveEdit = new ControllerClass();

ControllerCurveEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (!Controller.pressingKeySet.has("control") ||
    !EdgeRenderer.isCurrentRendererCurve() || event.button !== 0) {
    return;
  }
  for (const edge of Stage.hoverEdges) {
    edge.isEditingStructure = !edge.isEditingStructure;
  }
};