import { Rectangle } from "../../dataStruct/shape/Rectangle";
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

ControllerLayerMoving.mousemove = (event: MouseEvent) => {
  if (!Controller.pressingKeySet.has("alt")) {
    return;
  }
  if (StageManager.getSelectedEntities().length === 0) {
    return;
  }
  Controller.mouseLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
};

ControllerLayerMoving.mouseup = (event: MouseEvent) => {
  if (!Controller.pressingKeySet.has("alt")) {
    return;
  }
  if (StageManager.getSelectedEntities().length === 0) {
    return;
  }
  const mouseLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

  // 即将跳入的sections区域
  const targetSections =
    StageManager.SectionOptions.getSectionsByInnerLocation(mouseLocation);
  const selectedEntities = StageManager.getSelectedEntities();
  // 移动位置

  // 1 计算当前框选的所有实体的中心位置
  const rectangles = selectedEntities.map((entity) => {
    return entity.collisionBox.getRectangle();
  });
  // 2 计算delta
  const delta = mouseLocation.subtract(
    Rectangle.getBoundingRectangle(rectangles).center,
  );
  // 3 移动所有选中的实体
  StageManager.moveEntities(delta);

  // 改变层级
  if (targetSections.length === 0) {
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
    for (const section of targetSections) {
      StageManager.goInSection(selectedEntities, section);
      // 特效
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
