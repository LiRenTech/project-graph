import React from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { editTextNodeHookGlobal } from "../core/controller/concrete/utilsControl";
import { Controller } from "../core/controller/Controller";
import { Renderer } from "../core/render/canvas2d/renderer";
import { Camera } from "../core/stage/Camera";
import { TextNode } from "../core/stageObject/entity/TextNode";

export default function DetailsEditPanel() {
  const [inputCurrentDetails, setInputCurrentDetails] = React.useState("");
  const [isNodeTextEditing, setIsNodeTextEditing] = React.useState(false);
  const [clickedNode, setClickedNode] = React.useState<TextNode>();
  const setInputCurrentDetailsHandler = (value: string) => {
    setInputCurrentDetails(value);
  };
  const handleConfirmNodeTextEdit = () => {
    setIsNodeTextEditing(false);
    if (clickedNode) {
      editTextNodeHookGlobal.hookFunctionEnd(clickedNode);
    } else {
      console.warn("没有点击节点");
    }
  };
  const handleCancelNodeTextEdit = () => {
    setIsNodeTextEditing(false);
    Controller.isCameraLocked = false;
    if (clickedNode) {
      clickedNode.isEditingDetails = false;
    }
  };
  editTextNodeHookGlobal.hookFunctionStart = (textNode: TextNode) => {
    setInputCurrentDetails(textNode.details);
    setClickedNode(textNode);
    setIsNodeTextEditing(true);
  };
  editTextNodeHookGlobal.hookFunctionEnd = (textNode: TextNode) => {
    textNode.changeDetails(inputCurrentDetails);
    Controller.isCameraLocked = false;
    textNode.isEditingDetails = false;
  };
  const getClickedNodeStyle = () => {
    if (!clickedNode) {
      return {
        left: "0px",
        top: "0px",
      };
    }
    const collisionBoxRectangle = clickedNode.collisionBox.getRectangle();
    const heightViewSize = collisionBoxRectangle.size.y * Camera.currentScale;

    return {
      left: `${Renderer.transformWorld2View(collisionBoxRectangle.location).x}px`,
      top: `${Renderer.transformWorld2View(collisionBoxRectangle.location).y + heightViewSize}px`,
    };
  };

  return (
    <>
      {isNodeTextEditing && (
        <div
          className="fixed z-10 flex h-48 w-72 flex-col"
          style={getClickedNodeStyle()}
        >
          <Input
            multiline
            onChange={setInputCurrentDetailsHandler}
            value={inputCurrentDetails}
            className="mb-2 flex-1"
          />
          <div className="flex justify-around">
            <Button onClick={handleConfirmNodeTextEdit} className="mr-1 flex-1">
              确定
            </Button>
            <Button onClick={handleCancelNodeTextEdit} className="ml-1 flex-1">
              取消
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
