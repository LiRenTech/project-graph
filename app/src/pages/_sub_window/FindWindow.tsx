import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubWindow } from "@/core/service/SubWindow";
import { Camera } from "@/core/stage/Camera";
import { StageManager } from "@/core/stage/stageManager/StageManager";
import { cn } from "@/utils/cn";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { CaseSensitive, CaseUpper, Delete, SquareDashedMousePointer, Telescope } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * 搜索内容的面板
 */
export default function FindWindow() {
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState<{ title: string; uuid: string }[]>([]);
  // 是否开启快速瞭望模式
  const [isMouseEnterMoveCameraAble, setIsMouseEnterMoveCameraAble] = useState(false);

  const selectAllResult = () => {
    for (const result of searchResults) {
      const node = StageManager.getStageObjectByUUID(result.uuid);
      if (node) {
        node.isSelected = true;
      }
    }
    toast.success(`${searchResults.length}个结果已全部选中`);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="my-1 flex flex-wrap gap-3">
        <Button
          size="icon"
          onClick={() => {
            const currentResult = !isCaseSensitive;
            setIsCaseSensitive(currentResult);
            Stage.contentSearchEngine.isCaseSensitive = currentResult;
          }}
          tooltip={isCaseSensitive ? "不区分大小写" : "区分大小写"}
        >
          {isCaseSensitive ? <CaseSensitive /> : <CaseUpper />}
        </Button>
        <Button size="icon" onClick={selectAllResult} disabled={searchResults.length === 0} tooltip="将全部结果选中">
          <SquareDashedMousePointer />
        </Button>

        {searchResults.length >= 3 && (
          <Button
            size="icon"
            onClick={() => {
              setIsMouseEnterMoveCameraAble(!isMouseEnterMoveCameraAble);
            }}
            tooltip={isMouseEnterMoveCameraAble ? "快速瞭望模式" : "点击跳转模式"}
          >
            <Telescope />
          </Button>
        )}

        <Button
          size="icon"
          onClick={() => {
            setSearchString("");
            Stage.contentSearchEngine.startSearch("", false);
            setSearchResults([]);
          }}
          tooltip="取消"
        >
          <Delete />
        </Button>
      </div>

      <Input
        placeholder="请输入要在舞台上搜索的内容"
        autoFocus
        onChange={(value) => {
          setSearchString(value);
          Stage.contentSearchEngine.startSearch(value, false);
          setSearchResults(
            Stage.contentSearchEngine.searchResultNodes.map((node) => ({
              title: Stage.contentSearchEngine.getStageObjectText(node),
              uuid: node.uuid,
            })),
          );
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.altKey || e.metaKey) {
            // 取消默认事件
            e.preventDefault();
          } else if (e.key === "Escape") {
            if (searchString !== "") {
              // 取消搜索
              setSearchString("");
              setSearchResults([]);
            }
          }
        }}
        value={searchString}
      />
      <div className="overflow-y-auto">
        {searchResults.map((result, index) => (
          <div
            key={result.uuid}
            className={cn("hover:text-panel-success-text cursor-pointer truncate", {
              "font-bold": index === Stage.contentSearchEngine.currentSearchResultIndex,
            })}
            onMouseEnter={() => {
              if (isMouseEnterMoveCameraAble) {
                const node = StageManager.getStageObjectByUUID(result.uuid);
                if (node) {
                  Camera.location = node.collisionBox.getRectangle().center;
                }
              }
            }}
            onClick={() => {
              const node = StageManager.getStageObjectByUUID(result.uuid);
              if (node) {
                Camera.location = node.collisionBox.getRectangle().center;
              }
            }}
          >
            <span className="bg-settings-page-bg mr-0.5 rounded-sm px-1">{index + 1}</span>
            {result.title}
          </div>
        ))}
      </div>
    </div>
  );
}

FindWindow.open = () => {
  SubWindow.create({
    title: "搜索",
    children: <FindWindow />,
    rect: new Rectangle(new Vector(100, 100), new Vector(300, 300)),
  });
};
