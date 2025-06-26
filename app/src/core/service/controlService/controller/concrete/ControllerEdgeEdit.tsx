import { Dialog } from "../../../../../components/dialog";
import { Stage } from "../../../../stage/Stage";

import { ControllerClass } from "../ControllerClass";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export class ControllerEdgeEditClass extends ControllerClass {
  mouseDoubleClick = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    const firstHoverEdge = Stage.mouseInteractionCore.firstHoverEdge;
    const firstHoverMultiTargetEdge = Stage.mouseInteractionCore.firstHoverMultiTargetEdge;
    if (!(firstHoverEdge || firstHoverMultiTargetEdge)) {
      return;
    }
    if (firstHoverEdge) {
      // 编辑边上的文字
      this.project.controllerUtils.editEdgeText(firstHoverEdge);
    }
    if (firstHoverMultiTargetEdge) {
      this.project.controllerUtils.editMultiTargetEdgeText(firstHoverMultiTargetEdge);
    }

    return;
  };

  keydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      // 先检测是否有选择了的边
      const isHaveEdgeSelected = this.project.stageManager.getLineEdges().some((edge) => edge.isSelected);
      if (!isHaveEdgeSelected) {
        return;
      }

      Dialog.show({
        title: "重命名边",
        input: true,
      }).then(({ button, value }) => {
        if (button === "确定") {
          if (value) {
            for (const edge of this.project.stageManager.getLineEdges()) {
              if (edge.isSelected) {
                edge.rename(value);
              }
            }
          }
        }
      });
    }
  };
}
