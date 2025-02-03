import React from "react";
import Button from "../components/Button";
import { Dialog } from "../components/dialog";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";

/**
 * 标签相关面板
 * @param param0
 */
export default function TagPanel({ open = false, className = "" }: { open: boolean; className: string }) {
  const [tagNameList, setTagNameList] = React.useState<{ tagName: string; uuid: string }[]>([]);

  function updateTagNameList() {
    setTagNameList(StageManager.getTagNames());
  }

  React.useEffect(() => {
    updateTagNameList();
  }, [open]);

  const handleClickTag = (tagUUID: string) => {
    return () => {
      // 跳转到对应位置
      StageManager.moveToTag(tagUUID);
    };
  };

  const handleClickAddTag = () => {
    if (StageManager.selectedNodeCount === 0) {
      Dialog.show({
        title: "没选择节点",
        content: "请先在舞台上选中一个或多个节点",
        type: "error",
      });
    } else {
      StageManager.addTagBySelected();
      updateTagNameList();
    }
  };

  return (
    <div
      className={cn(
        "bg-panel-bg fixed -left-64 top-16 flex h-96 w-64 flex-col rounded-md p-2 transition-all",
        {
          "left-0": open,
        },
        className,
      )}
    >
      <div>
        <Button onClick={handleClickAddTag}>将选中节点添加标签</Button>
        <Button onClick={updateTagNameList}>刷新</Button>
      </div>

      {/* 标签列表 */}
      <div className="flex-1 overflow-y-auto">
        {tagNameList.map((tag) => {
          return (
            <div key={tag.uuid} className="cursor-pointer hover:bg-neutral-600" onClick={handleClickTag(tag.uuid)}>
              {tag.tagName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
