import { Stage } from "../../stage/Stage";

import { ControllerClass } from "../ControllerClass";

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
  if (Stage.hoverEdges.length > 0) {
    // 编辑边上的文字
    let user_input = prompt("请输入线上的文字", Stage.hoverEdges[0].text);
    if (user_input) {
      for (const edge of Stage.hoverEdges) {
        edge.rename(user_input);
      }
    }
    return;
  }
};
