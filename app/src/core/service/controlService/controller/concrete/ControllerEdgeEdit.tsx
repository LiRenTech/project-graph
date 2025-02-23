import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";

import { ControllerClass } from "../ControllerClass";
import { editEdgeText } from "./utilsControl";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerEdgeEdit = new ControllerClass();

ControllerEdgeEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  const firstHoverEdge = Stage.mouseInteractionCore.firstHoverEdge;
  if (!firstHoverEdge) {
    return;
  }

  // 编辑边上的文字
  editEdgeText(firstHoverEdge);

  // const user_input = prompt("请输入线上的文字", firstHoverEdge.text);
  // if (user_input) {
  //   for (const edge of Stage.mouseInteractionCore.hoverEdges) {
  //     edge.rename(user_input);
  //   }
  // }
  return;
};

ControllerEdgeEdit.keydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    // 先检测是否有选择了的边
    const isHaveEdgeSelected = StageManager.getLineEdges().some((edge) => edge.isSelected);
    if (!isHaveEdgeSelected) {
      return;
    }

    const user_input = prompt("请输入线上的文字", "");
    if (user_input) {
      for (const edge of StageManager.getLineEdges()) {
        if (edge.isSelected) {
          edge.rename(user_input);
        }
      }
    }
  }
};
