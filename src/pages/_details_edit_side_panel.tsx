import React from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { editTextNodeHookGlobal } from "../core/controller/concrete/utilsControl";
import { Controller } from "../core/controller/Controller";
import { Entity } from "../core/stageObject/StageObject";
import { cn } from "../utils/cn";

export default function DetailsEditSidePanel() {
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

  return (
    <>
      {
        <div
          className={cn(
            "fixed -right-96 top-0 z-50 flex h-full w-96 flex-col transition-all",
            // getClickedNodeStyle(),
            isNodeTextEditing && "-right-0",
          )}
        >
          {/* 顶部空白 */}
          <div className="h-16" />
          <Button>编辑模式</Button>
          <Input
            multiline
            onChange={setInputCurrentDetailsHandler}
            value={inputCurrentDetails}
            className="my-2 flex-1"
          />
          <div className="flex justify-around">
            <Button onClick={handleConfirmDetailsEdit} className="mr-1 flex-1">
              确定
            </Button>
            <Button onClick={handleCancelDetailsEdit} className="ml-1 flex-1">
              取消
            </Button>
          </div>
          {/* 底部空白 */}
          <div className="h-8" />
        </div>
      }
    </>
  );
}
