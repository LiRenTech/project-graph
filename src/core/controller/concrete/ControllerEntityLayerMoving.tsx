import { Vector } from "../../dataStruct/Vector";
import { RectanglePushInEffect } from "../../effect/concrete/RectanglePushInEffect";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 创建节点层级移动控制器
 */
export const ControllerLayerMoving = new ControllerClass();

ControllerLayerMoving.keydown = (event: KeyboardEvent) => {
  if (event.key === "Alt") {
    // 按下Alt键，开始移动节点层级
    Stage.isLayerMovingMode = true;
  }
};
ControllerLayerMoving.keyup = (event: KeyboardEvent) => {
  if (event.key === "Alt") {
    // 松开Alt键，结束移动节点层级
    Stage.isLayerMovingMode = false;
  }
};

ControllerLayerMoving.mousemove = (event: MouseEvent) => {
  if (!Stage.isLayerMovingMode) {
    return;
  }
  Controller.mouseLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
};

ControllerLayerMoving.mouseup = (event: MouseEvent) => {
  if (!Stage.isLayerMovingMode) {
    return;
  }
  const mouseLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const sections =
    StageManager.SectionOptions.getSectionsByInnerLocation(mouseLocation);

  const selectedEntities = StageManager.getSelectedEntities();
  if (sections.length === 0) {
    // 代表想要走出当前section
    for (const entity of selectedEntities) {
      const currentFatherSections =
        StageManager.SectionOptions.getFatherSections(entity);
      if (currentFatherSections.length === 0) {
        continue;
      }
      StageManager.goOutSection([entity], currentFatherSections[0]);
    }
  } else {
    for (const section of sections) {
      StageManager.goInSection(selectedEntities, section);
      for (const entity of selectedEntities) {
        Stage.effects.push(
          new RectanglePushInEffect(
            entity.collisionBox.getRectangle(),
            section.collisionBox.getRectangle(),
          ),
        );
      }
    }
  }
};
