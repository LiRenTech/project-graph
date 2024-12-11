import { Vector } from "../../dataStruct/Vector";
import { TextNode } from "../../stageObject/entity/TextNode";
import { Renderer } from "../../render/canvas2d/renderer";
import { Camera } from "../../stage/Camera";
import { Controller } from "../Controller";
import { Entity } from "../../stageObject/StageObject";

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
