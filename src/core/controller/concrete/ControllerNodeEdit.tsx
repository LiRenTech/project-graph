import { StageManager } from "../../stage/stageManager/StageManager";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { ControllerClass } from "../ControllerClass";
import { editNode, editNodeDetails } from "./utilsControl";
import { Controller } from "../Controller";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerNodeEdit = new ControllerClass();

ControllerNodeEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  const pressLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  let clickedNode = StageManager.findNodeByLocation(pressLocation);
  if (clickedNode === null) {
    console.log("没有编辑节点");
    return;
  }
  console.log("编辑节点");
  if (Controller.pressingKeySet.has("control")) {
    editNodeDetails(clickedNode);
  } else {
    editNode(clickedNode);
  }
};
