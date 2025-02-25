import { Angry, MousePointerClick, RefreshCcw, Smile, Tags, Telescope } from "lucide-react";
import React from "react";
import { Dialog } from "../../components/dialog";
import IconButton from "../../components/IconButton";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { cn } from "../../utils/cn";

/**
 * 标签相关面板
 * @param param0
 */
export default function TagPanel({ open = false, className = "" }: { open: boolean; className: string }) {
  const [tagNameList, setTagNameList] = React.useState<{ tagName: string; uuid: string }[]>([]);
  // 是否开启允许滑动移动摄像机
  const [isMouseEnterMoveCameraAble, setIsMouseEnterMoveCameraAble] = React.useState(false);
  // 是否开启透视
  const [isPerspective, setIsPerspective] = React.useState(false);

  function refreshTagNameList() {
    setTagNameList(StageManager.refreshTags());
  }

  React.useEffect(() => {
    refreshTagNameList();
  }, [open]);

  const handleMoveCameraToTag = (tagUUID: string) => {
    return () => {
      // 跳转到对应位置
      StageManager.moveCameraToTag(tagUUID);
    };
  };

  const handleMoveUp = (tagUUID: string) => {
    return () => {
      // 向上移动标签
      StageManager.TagOptions.moveUpTag(tagUUID);
      refreshTagNameList();
    };
  };
  const handleMoveDown = (tagUUID: string) => {
    return () => {
      // 向下移动标签
      StageManager.TagOptions.moveDownTag(tagUUID);
      refreshTagNameList();
    };
  };

  const handleMouseEnterTag = (tagUUID: string) => {
    return () => {
      if (isMouseEnterMoveCameraAble) {
        StageManager.moveCameraToTag(tagUUID);
      } else {
        console.warn("禁止滑动");
      }
    };
  };

  const handleClickAddTag = () => {
    // 检查是否有选中的entity或连线
    if (StageManager.getSelectedEntities().length === 0 && StageManager.getSelectedAssociations().length === 0) {
      Dialog.show({
        title: "请先选中舞台上的物体",
        content: "选中后再点此按钮，即可添标签",
      });
    }
    StageManager.addTagBySelected();
    refreshTagNameList();
  };

  return (
    <div
      className={cn(
        "fixed -left-64 top-16 flex h-full w-64 flex-col rounded-md p-4 pb-20 transition-all",
        {
          "left-0": open,
          "bg-panel-bg": !isPerspective,
        },
        className,
      )}
    >
      <div className="flex justify-center gap-2">
        <IconButton
          onClick={handleClickAddTag}
          tooltip="选中节点并添加到标签，如果选中了已经是标签的节点，则会移出标签"
        >
          <Tags />
        </IconButton>
        <IconButton onClick={refreshTagNameList} tooltip="如果舞台上的标签发生变更但此处未更新，可以手动刷新">
          <RefreshCcw />
        </IconButton>
        {tagNameList.length >= 3 && (
          <IconButton
            onClick={() => {
              setIsMouseEnterMoveCameraAble(!isMouseEnterMoveCameraAble);
            }}
            tooltip={isMouseEnterMoveCameraAble ? "快速瞭望模式" : "点击跳转模式"}
          >
            {isMouseEnterMoveCameraAble ? <Telescope /> : <MousePointerClick />}
          </IconButton>
        )}
        {tagNameList.length > 0 && (
          <IconButton
            onClick={() => {
              setIsPerspective(!isPerspective);
            }}
            tooltip={isPerspective ? "透视已开启" : "开启透视眼"}
          >
            {isPerspective ? <Angry /> : <Smile />}
          </IconButton>
        )}
      </div>

      {/* 标签列表 */}
      {tagNameList.length === 0 ? (
        <div>
          <h3 className="text-select-text text-lg">当前还没有标签</h3>
          <p className="text-select-option-hover-text text-sm">
            给节点添加标签后会显示在左侧面板中，方便知道舞台上都有哪些主要内容，点击内容即可跳转
          </p>
        </div>
      ) : (
        <div className="mt-2 flex-1 flex-col justify-center overflow-y-auto p-2">
          {tagNameList.map((tag) => {
            return (
              <div
                key={tag.uuid}
                className="text-select-option-text hover:text-select-option-hover-text hover:bg-icon-button-bg flex cursor-pointer items-center truncate text-left"
                onMouseEnter={handleMouseEnterTag(tag.uuid)}
              >
                <span onClick={handleMoveCameraToTag(tag.uuid)} className="flex-1 cursor-pointer hover:underline">
                  {tag.tagName}
                </span>
                <span
                  className="text-panel-text border-panel-details-text border-1 mx-0.5 cursor-pointer rounded text-xs hover:scale-105 active:scale-95"
                  onClick={handleMoveUp(tag.uuid)}
                >
                  ↑
                </span>
                <span
                  className="text-panel-text border-panel-details-text border-1 mx-0.5 cursor-pointer rounded text-xs hover:scale-105 active:scale-95"
                  onClick={handleMoveDown(tag.uuid)}
                >
                  ↓
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
