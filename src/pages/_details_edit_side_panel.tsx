import React from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { editTextNodeHookGlobal } from "../core/controller/concrete/utilsControl";
import { Controller } from "../core/controller/Controller";
import { Entity } from "../core/stageObject/StageObject";
import { cn } from "../utils/cn";
import IconButton from "../components/ui/IconButton";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";

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

  const [isFullScreen, setIsFullScreen] = React.useState(false);
  // 将整个面板侧向伸展成全屏或缩小到原来的尺寸
  const switchPanelSize = () => {
    setIsFullScreen(!isFullScreen);
  };
  return (
    <>
      {
        <div
          className={cn(
            "fixed top-16 z-50 flex h-full flex-col transition-all",
            isFullScreen ? "right-0 w-full" : "-right-96 w-96",
            isNodeTextEditing && "right-0",
          )}
        >
          <div className="flex gap-2">
            <IconButton onClick={switchPanelSize}>
              {isFullScreen ? <ArrowRightFromLine /> : <ArrowLeftFromLine />}
            </IconButton>
            <Button className="flex-1">编辑模式</Button>
            <Button onClick={handleConfirmDetailsEdit}>确认修改</Button>
            {/* 取消，关闭 */}
            <Button onClick={handleCancelDetailsEdit}>取消修改</Button>
          </div>
          <Input
            multiline
            onChange={setInputCurrentDetailsHandler}
            value={inputCurrentDetails}
            className="my-2 flex-1"
            enableFocusOpacity={false}
          />
          {/* 底部空白 */}
          <div className="h-16" />
        </div>
      }
    </>
  );
}
