import { CaseSensitive, CaseUpper, Delete, SquareDashedMousePointer, Telescope } from "lucide-react";
import { useState } from "react";
import IconButton from "../../components/IconButton";
import Input from "../../components/Input";
import { Rectangle } from "../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../core/dataStruct/Vector";
import { TextRiseEffect } from "../../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { SubWindow } from "../../core/service/SubWindow";
import { Camera } from "../../core/stage/Camera";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { cn } from "../../utils/cn";

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
    this.project.effects.addEffect(TextRiseEffect.default(`${searchResults.length}个结果已全部选中`));
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="my-1 flex flex-wrap gap-3">
        <IconButton
          onClick={() => {
            const currentResult = !isCaseSensitive;
            setIsCaseSensitive(currentResult);
            Stage.contentSearchEngine.isCaseSensitive = currentResult;
          }}
          tooltip={isCaseSensitive ? "不区分大小写" : "区分大小写"}
        >
          {isCaseSensitive ? <CaseSensitive /> : <CaseUpper />}
        </IconButton>
        <IconButton onClick={selectAllResult} disabled={searchResults.length === 0} tooltip="将全部结果选中">
          <SquareDashedMousePointer />
        </IconButton>

        {searchResults.length >= 3 && (
          <IconButton
            onClick={() => {
              setIsMouseEnterMoveCameraAble(!isMouseEnterMoveCameraAble);
            }}
            tooltip={isMouseEnterMoveCameraAble ? "快速瞭望模式" : "点击跳转模式"}
          >
            <Telescope />
          </IconButton>
        )}

        <IconButton
          onClick={() => {
            setSearchString("");
            Stage.contentSearchEngine.startSearch("", false);
            setSearchResults([]);
          }}
          tooltip="取消"
        >
          <Delete />
        </IconButton>
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
