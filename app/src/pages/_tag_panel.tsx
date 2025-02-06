import { Plus, RefreshCcw } from "lucide-react";
import React from "react";
import IconButton from "../components/IconButton";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";

/**
 * 标签相关面板
 * @param param0
 */
export default function TagPanel({ open = false, className = "" }: { open: boolean; className: string }) {
  const [tagNameList, setTagNameList] = React.useState<{ tagName: string; uuid: string }[]>([]);

  function refreshTagNameList() {
    setTagNameList(StageManager.refreshTags());
  }

  React.useEffect(() => {
    refreshTagNameList();
  }, [open]);

  const handleClickTag = (tagUUID: string) => {
    return () => {
      // 跳转到对应位置
      StageManager.moveToTag(tagUUID);
    };
  };

  const handleClickAddTag = () => {
    // TODO: 这里可能缺少一个是否有选中的实体的检测
    StageManager.addTagBySelected();
    refreshTagNameList();
  };

  return (
    <div
      className={cn(
        "bg-panel-bg fixed -left-64 top-16 flex h-full w-64 flex-col rounded-md p-4 transition-all",
        {
          "left-0": open,
        },
        className,
      )}
    >
      <div className="flex justify-center gap-2">
        <IconButton
          onClick={handleClickAddTag}
          tooltip="添加选中的文本节点成为标签，如果选中了已经是标签的节点，则会取消标签状态"
        >
          <Plus />
        </IconButton>
        <IconButton onClick={refreshTagNameList} tooltip="如果舞台上的标签发生变更但此处未更新，可以手动刷新">
          <RefreshCcw />
        </IconButton>
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
        <div className="mt-2 flex-1 flex-col justify-center overflow-y-auto">
          {tagNameList.map((tag) => {
            return (
              <div
                key={tag.uuid}
                className="text-select-option-text hover:text-select-option-hover-text cursor-pointer text-center hover:underline"
                onClick={handleClickTag(tag.uuid)}
              >
                {tag.tagName}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
