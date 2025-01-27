import React from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { Renderer } from "../core/render/canvas2d/renderer";
import { editTextNodeHookGlobal } from "../core/service/controlService/controller/concrete/utilsControl";
import { Controller } from "../core/service/controlService/controller/Controller";
import { Camera } from "../core/stage/Camera";
import { Entity } from "../core/stage/stageObject/abstract/StageEntity";

/**
 * 2025年1月4日，这个打算被侧边栏取代 ——littlefean
 * @returns
 */
export default function DetailsEditPanel() {
  const [inputCurrentDetails, setInputCurrentDetails] = React.useState("");
  const [isNodeTextEditing, setIsNodeTextEditing] = React.useState(false);
  const [clickedNode, setClickedNode] = React.useState<Entity>();
  const setInputCurrentDetailsHandler = (value: string) => {
    setInputCurrentDetails(value);
  };
  const handleConfirmDetailsEdit = () => {
    setIsNodeTextEditing(false);
    if (clickedNode) {
      editTextNodeHookGlobal.hookFunctionEnd(clickedNode);
    } else {
      console.warn("没有点击节点");
    }
  };
  const handleCancelDetailsEdit = () => {
    setIsNodeTextEditing(false);
    Controller.isCameraLocked = false;
    if (clickedNode) {
      clickedNode.isEditingDetails = false;
    }
  };
  editTextNodeHookGlobal.hookFunctionStart = (entity: Entity) => {
    setInputCurrentDetails(entity.details);
    setClickedNode(entity);
    setIsNodeTextEditing(true);
  };
  editTextNodeHookGlobal.hookFunctionEnd = (entity: Entity) => {
    entity.changeDetails(inputCurrentDetails);
    Controller.isCameraLocked = false;
    entity.isEditingDetails = false;
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
            <Button onClick={handleConfirmDetailsEdit} className="mr-1 flex-1">
              确定
            </Button>
            <Button onClick={handleCancelDetailsEdit} className="ml-1 flex-1">
              取消
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
