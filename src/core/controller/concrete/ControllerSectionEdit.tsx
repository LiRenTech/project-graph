import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";

import { ControllerClass } from "../ControllerClass";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerSectionEdit = new ControllerClass();

ControllerSectionEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Stage.hoverSections.length > 0) {
    // 编辑文字
    const user_input = prompt("请输入文字", Stage.hoverSections[0].text);
    if (user_input) {
      for (const section of Stage.hoverSections) {
        section.rename(user_input);
      }
    }
    return;
  }
};

ControllerSectionEdit.mousemove = (event: MouseEvent) => {
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  Stage.hoverSections = [];
  const sections = StageManager.getSections();

  for (const section of sections) {
    if (section.collisionBox.isPointInCollisionBox(worldLocation)) {
      Stage.hoverSections.push(section);
    }
  }
};

ControllerSectionEdit.keydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    // 先检测是否有选择了的边
    const isHaveSectionSelected = StageManager.getSections().some(
      (section) => section.isSelected,
    );
    if (!isHaveSectionSelected) {
      return;
    }

    const user_input = prompt("请输入线上的文字", "");
    if (user_input) {
      for (const section of StageManager.getSections()) {
        if (section.isSelected) {
          section.rename(user_input);
        }
      }
    }
  }
};
