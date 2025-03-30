import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageNodeAdder } from "../../../../stage/stageManager/concreteMethods/stageNodeAdder";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { addTextNodeByLocation } from "./utilsControl";

/**
 * 创建节点的控制器
 */
export const ControllerEntityCreate = new ControllerClass();

ControllerEntityCreate.mouseDoubleClick = (event: MouseEvent) => {
  // 双击只能在左键
  if (!(event.button === 0)) {
    return;
  }
  if (Stage.drawingMachine.isUsing) {
    // 绘制模式不能使用创建节点
    return;
  }

  Stage.selectMachine.shutDown();

  const pressLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

  // 排除：在实体上双击或者在线上双击
  if (StageManager.isEntityOnLocation(pressLocation) || StageManager.isAssociationOnLocation(pressLocation)) {
    return;
  }

  // 是否是在Section内部双击
  const sections = SectionMethods.getSectionsByInnerLocation(pressLocation);

  if (Controller.pressingKeySet.has("`")) {
    createConnectPoint(pressLocation, sections);
  } else {
    // 双击创建节点
    addTextNodeByLocation(pressLocation, true);
  }
};

function createConnectPoint(pressLocation: Vector, addToSections: Section[]) {
  StageNodeAdder.addConnectPoint(pressLocation, addToSections);
}
