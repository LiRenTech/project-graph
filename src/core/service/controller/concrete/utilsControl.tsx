import { isDesktop } from "../../../../utils/platform";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { InputElement } from "../../../render/domElement/inputElement";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { UrlNode } from "../../../stageObject/entity/UrlNode";
import { Entity } from "../../../stageObject/StageObject";
import { EntityCreateLineEffect } from "../../effectEngine/concrete/EntityCreateLineEffect";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Controller } from "../Controller";

/**
 * 可能有多个控制器公用同一个代码，
 * 这里专门存放代码相同的地方
 */

/**
 * 编辑节点
 * @param clickedNode
 */
export function editTextNode(clickedNode: TextNode) {
  Controller.isCameraLocked = true;

  // 编辑节点
  clickedNode.isEditing = true;
  InputElement.textarea(
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
      color: StageStyleManager.currentStyle.StageObjectBorderColor.toString(),
      outline: "solid 1px rgba(255,255,255,0.1)",
      // marginTop: -8 * Camera.currentScale + "px",
    },
  ).then(() => {
    clickedNode!.isEditing = false;
    Controller.isCameraLocked = false;
  });
}

export function editUrlNodeTitle(clickedUrlNode: UrlNode) {
  Controller.isCameraLocked = true;
  // 编辑节点
  clickedUrlNode.isEditingTitle = true;
  InputElement.input(
    Renderer.transformWorld2View(clickedUrlNode.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedUrlNode.title,
    (text) => {
      clickedUrlNode?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorderColor.toString(),
      outline: "none",
      marginTop: -8 * Camera.currentScale + "px",
      width: "100vw",
    },
  ).then(() => {
    clickedUrlNode!.isEditingTitle = false;
    Controller.isCameraLocked = false;
  });
}

/**
 * 一个全局对象，用于编辑节点的钩子函数
 */
export const editTextNodeHookGlobal = {
  /**
   * 编辑节点的钩子函数，用于开始编辑，弹窗触发
   * @param _
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionStart(_: Entity) {
    // 在外部将被修改
  },
  /**
   * 编辑节点的钩子函数，用于结束编辑，弹窗关闭
   * @param _
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionEnd(_: Entity) {
    // 在外部将被修改
  },
};

/**
 * 通过快捷键的方式来打开Entity的详细信息编辑
 */
export function editNodeDetailsByKeyboard() {
  const nodes = StageManager.getEntities().filter((node) => node.isSelected);
  if (nodes.length === 0) {
    return;
  }
  editNodeDetails(nodes[0]);
}

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
  Stage.effectMachine.addEffect(EntityCreateLineEffect.from(rect));
  if (isDesktop) {
    editTextNode(createNode);
  }
}
