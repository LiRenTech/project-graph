import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageSectionInOutManager } from "../../../../stage/stageManager/concreteMethods/StageSectionInOutManager";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { EntityJumpMoveEffect } from "../../../feedbackService/effectEngine/concrete/EntityJumpMoveEffect";
import { RectanglePushInEffect } from "../../../feedbackService/effectEngine/concrete/RectanglePushInEffect";
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
  Controller.mouseLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
};

ControllerLayerMoving.mouseup = (event: MouseEvent) => {
  if (!Controller.pressingKeySet.has("alt")) {
    return;
  }
  if (StageManager.getSelectedEntities().length === 0) {
    return;
  }
  const mouseLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  // 提前检查点击的位置是否有一个TextNode，如果有，则转换成Section
  const entity = StageManager.findEntityByLocation(mouseLocation);
  if (entity && entity instanceof TextNode) {
    const newSection = StageManager.targetTextNodeToSection(entity);
    const selectedEntities = StageManager.getSelectedEntities();
    // StageManager.goInSection(StageManager.getSelectedEntities(), newSection);
    StageSectionInOutManager.goInSections(StageManager.getSelectedEntities(), [newSection]);
    // 最后让所有选中的实体移动
    for (const selectedEntity of selectedEntities) {
      selectedEntity.moveTo(mouseLocation);
    }
    return; // 这个return必须写
  }

  // 即将跳入的sections区域
  const targetSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
  const selectedEntities = StageManager.getSelectedEntities();
  // 移动位置

  // 1 计算所有节点应该移动的 delta
  // 1.0 计算当前框选的所有实体的中心位置
  const selectedRectangles = selectedEntities.map((entity) => {
    return entity.collisionBox.getRectangle();
  });
  const centerLocation = Rectangle.getBoundingRectangle(selectedRectangles).center;

  const delta = mouseLocation.subtract(centerLocation);
  // 4 特效(要先加特效，否则位置已经被改了)
  for (const entity of selectedEntities) {
    Stage.effectMachine.addEffect(new EntityJumpMoveEffect(15, entity.collisionBox.getRectangle(), delta));
  }
  // 3 移动所有选中的实体 的位置
  StageManager.moveEntities(delta);

  // 改变层级
  if (targetSections.length === 0) {
    // 代表想要走到最外层空白位置
    for (const entity of selectedEntities) {
      const currentFatherSections = SectionMethods.getFatherSections(entity);
      for (const currentFatherSection of currentFatherSections) {
        StageManager.goOutSection([entity], currentFatherSection);

        // 特效
        Stage.effectMachine.addEffect(
          RectanglePushInEffect.sectionGoInGoOut(
            entity.collisionBox.getRectangle(),
            currentFatherSection.collisionBox.getRectangle(),
            true,
          ),
        );
      }
    }
  } else {
    // 跑到了别的层级之中

    StageSectionInOutManager.goInSections(selectedEntities, targetSections);

    for (const section of targetSections) {
      // StageManager.goInSection(selectedEntities, section);

      // 特效
      for (const entity of selectedEntities) {
        Stage.effectMachine.addEffect(
          RectanglePushInEffect.sectionGoInGoOut(
            entity.collisionBox.getRectangle(),
            section.collisionBox.getRectangle(),
          ),
        );
      }
    }
  }
};
