import { Vector } from "../../dataStruct/Vector";
import { TextNode } from "../../stageObject/entity/TextNode";
import { Renderer } from "../../render/canvas2d/renderer";
import { Camera } from "../../stage/Camera";
import { Controller } from "../Controller";
import { Entity } from "../../stageObject/StageObject";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Stage } from "../../stage/Stage";
import { EntityCreateLineEffect } from "../../effect/concrete/EntityCreateLineEffect";
import { isDesktop } from "../../../utils/platform";

/**
 * 可能有多个控制器公用同一个代码，
 * 这里专门存放代码相同的地方
 */

/**
 * 编辑节点
 * @param clickedNode
 */
export function editNode(clickedNode: TextNode) {
  Controller.isCameraLocked = true;

  // 编辑节点
  clickedNode.isEditing = true;
  Renderer.input(
    Renderer.transformWorld2View(clickedNode.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedNode.text,
    (text) => {
      clickedNode?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: "white",
      outline: "none",
      marginTop: -8 * Camera.currentScale + "px",
      width: "100vw",
    },
  ).then(() => {
    clickedNode!.isEditing = false;
    Controller.isCameraLocked = false;
  });
}

/**
 * 一个全局对象，用于编辑节点的钩子函数
 */
export const editTextNodeHookGlobal = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionStart(_: Entity) {
    // 在外部将被修改
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionEnd(_: Entity) {
    // 在外部将被修改
  },
};

export function editNodeDetails(clickedNode: Entity) {
  Controller.isCameraLocked = true;

  clickedNode.isEditingDetails = true;
  editTextNodeHookGlobal.hookFunctionStart(clickedNode);
}

export function addTextNodeByLocation(
  location: Vector,
  selectCurrent: boolean = false,
) {
  const sections =
    StageManager.SectionOptions.getSectionsByInnerLocation(location);
  // 新建节点
  StageManager.addTextNodeByClick(location, sections, selectCurrent).then(
    (uuid) => {
      textNodeInEditModeByUUID(uuid);
    },
  );
}

export function addTextNodeFromCurrentSelectedNode(
  direction: "up" | "down" | "left" | "right",
  selectCurrent = false,
) {
  StageManager.addTextNodeFromCurrentSelectedNode(
    direction,
    selectCurrent,
  ).then((uuid) => {
    textNodeInEditModeByUUID(uuid);
  });
}

function textNodeInEditModeByUUID(uuid: string) {
  const createNode = StageManager.getTextNodeByUUID(uuid);
  if (createNode === null) {
    // 说明 创建了立刻删掉了
    return;
  }
  const rect = createNode.collisionBox.getRectangle();
  // 整特效
  Stage.effects.push(EntityCreateLineEffect.from(rect));
  if (isDesktop) {
    editNode(createNode);
  }
}
