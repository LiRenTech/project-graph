import { Dialog } from "../../../../../components/dialog";
import { Vector } from "../../../../dataStruct/Vector";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";

import { editSectionTitle } from "./utilsControl";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export class ControllerSectionEdit {
  mouseDoubleClick = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    const firstHoverSection = Stage.mouseInteractionCore.firstHoverSection;
    if (!firstHoverSection) {
      return;
    }

    // 编辑文字
    editSectionTitle(firstHoverSection);
    return;
  };

  mousemove = (event: MouseEvent) => {
    const worldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    Stage.mouseInteractionCore.updateByMouseMove(worldLocation);
  };

  keydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const isHaveSectionSelected = StageManager.getSections().some((section) => section.isSelected);
      if (!isHaveSectionSelected) {
        return;
      }
      Dialog.show({
        title: "重命名",
        input: true,
      }).then(({ button, value }) => {
        if (button === "确定") {
          if (value) {
            for (const section of StageManager.getSections()) {
              if (section.isSelected) {
                section.rename(value);
              }
            }
          }
        } else {
          console.log(button, value);
        }
      });
    }
  };
}
