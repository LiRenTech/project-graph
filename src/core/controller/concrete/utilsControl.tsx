import { Vector } from "../../dataStruct/Vector";
import { TextNode } from "../../entity/TextNode";
import { Renderer } from "../../render/canvas2d/renderer";
import { Camera } from "../../stage/Camera";
import { Controller } from "../Controller";

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

export function editNodeDetails(clickedNode: TextNode) {
  Controller.isCameraLocked = true;

  clickedNode.isEditingDetails = true;
  // 有待把input换成
  Renderer.textarea(
    Renderer.transformWorld2View(
      clickedNode.rectangle.location.add(
        new Vector(0, clickedNode.rectangle.size.y),
      ),
    ),
    clickedNode.details,
    (text) => {
      clickedNode?.changeDetails(text);
      console.log(text);
      // BUG: 空格，回车，方向键都被屏蔽了
    },
    {
      fontSize: Renderer.FONT_SIZE_DETAILS * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: "white",
      outline: "solid 1px white",
      // marginTop: -8 * Camera.currentScale + "px",
      width: Renderer.NODE_DETAILS_WIDTH * Camera.currentScale + "px",
    },
  ).then(() => {
    Controller.isCameraLocked = false;
    clickedNode.isEditingDetails = false;
  });
}
