import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import React from "react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Input from "../components/ui/Input";
import { editTextNodeHookGlobal } from "../core/service/controlService/controller/concrete/utilsControl";
import { Controller } from "../core/service/controlService/controller/Controller";
import { Entity } from "../core/stage/stageObject/abstract/StageEntity";
import { cn } from "../utils/cn";
// import "vditor/src/assets/scss/index.scss";
import MarkdownEditor from "./_vditor_panel";

export default function DetailsEditSidePanel() {
  const [inputCurrentDetails, setInputCurrentDetails] = React.useState("");
  const [isNodeTextEditing, setIsNodeTextEditing] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(true);
  const [clickedNode, setClickedNode] = React.useState<Entity>();
  const setInputCurrentDetailsHandler = (value?: string | undefined) => {
    if (value !== undefined) {
      setInputCurrentDetails(value);
    }
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
      {isNodeTextEditing && (
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
            <Button
              className="flex-1"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "切换到渲染模式" : "切换到编辑模式"}
            </Button>
            <Button onClick={handleConfirmDetailsEdit}>确认修改</Button>
            {/* 取消，关闭 */}
            <Button onClick={handleCancelDetailsEdit}>取消修改</Button>
          </div>
          {isEditMode ? (
            <Input
              multiline
              onChange={setInputCurrentDetailsHandler}
              value={inputCurrentDetails}
              className="my-2 flex flex-1"
              enableFocusOpacity={false}
            />
          ) : (
            <MarkdownEditor
              onChange={setInputCurrentDetailsHandler}
              initialValue={inputCurrentDetails}
            />
          )}

          {/* 底部空白 */}
          <div className="h-16" />
        </div>
      )}
    </>
  );
}
