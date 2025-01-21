import React, { useEffect } from "react";
import Box from "../components/ui/Box";
import Button from "../components/ui/Button";
import { Color } from "../core/dataStruct/Color";
import { ProgressNumber } from "../core/dataStruct/ProgressNumber";
import { Controller } from "../core/service/controller/Controller";
import { RectangleNoteEffect } from "../core/service/effectEngine/concrete/RectangleNoteEffect";
import { Camera } from "../core/stage/Camera";
import { Stage } from "../core/stage/Stage";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { Dialog } from "../utils/dialog";

export default function SearchingNodePanel() {
  // region 搜索相关
  const [isSearchingShow, setIsSearchingShow] = React.useState(false);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] =
    React.useState(0);

  useEffect(() => {
    if (Stage.searchResultNodes.length == 0) {
      setCurrentSearchResultIndex(-1);
    } else {
      setCurrentSearchResultIndex(Stage.currentSearchResultIndex);
    }
  }, [Stage.currentSearchResultIndex]);

  const [searchResultCount, setSearchResultCount] = React.useState(0);
  useEffect(() => {
    setSearchResultCount(Stage.searchResultNodes.length);
  }, [Stage.searchResultNodes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Controller.pressingKeySet.has("control") && event.key === "f") {
        Controller.pressingKeySet.clear();
        const searchString = prompt("请输入要搜索的节点名称");
        if (searchString) {
          // 开始搜索
          Stage.searchResultNodes = [];
          for (const node of StageManager.getTextNodes()) {
            if (node.text.includes(searchString)) {
              Stage.searchResultNodes.push(node);
            }
          }
          Stage.currentSearchResultIndex = 0;
          if (Stage.searchResultNodes.length > 0) {
            setIsSearchingShow(true);
            setCurrentSearchResultIndex(0);
            // 选择第一个搜索结果节点
            const currentNode =
              Stage.searchResultNodes[Stage.currentSearchResultIndex];
            // currentNode.isSelected = true;
            Stage.effects.push(
              new RectangleNoteEffect(
                new ProgressNumber(0, 50),
                currentNode.rectangle,
                Color.Green,
              ),
            );
            // 摄像机对准现在的节点
            Camera.location = currentNode.rectangle.center.clone();
          } else {
            Dialog.show({
              title: "提示",
              type: "info",
              content: "没有找到匹配的节点",
            });
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
  // endregion

  return (
    <>
      {isSearchingShow && (
        <Box className="fixed right-32 top-32 z-10 flex transform items-center p-4 opacity-50 hover:opacity-100">
          <span>
            {currentSearchResultIndex + 1}/{searchResultCount}
          </span>
          <Button
            className="m-2"
            onClick={() => {
              if (Stage.currentSearchResultIndex > 0) {
                Stage.currentSearchResultIndex--;
              }
              // 取消选择所有节点
              for (const node of StageManager.getTextNodes()) {
                node.isSelected = false;
              }
              // 选择当前搜索结果节点
              const currentNode =
                Stage.searchResultNodes[Stage.currentSearchResultIndex];
              Stage.effects.push(
                new RectangleNoteEffect(
                  new ProgressNumber(0, 50),
                  currentNode.rectangle,
                  Color.Green,
                ),
              );
              // 摄像机对准现在的节点
              Camera.location = currentNode.rectangle.center.clone();
            }}
          >
            上一项
          </Button>
          <Button
            className="m-2"
            onClick={() => {
              if (Stage.currentSearchResultIndex < searchResultCount - 1) {
                Stage.currentSearchResultIndex++;
              }
              // 取消选择所有节点
              for (const node of StageManager.getTextNodes()) {
                node.isSelected = false;
              }
              // 选择当前搜索结果节点
              const currentNode =
                Stage.searchResultNodes[Stage.currentSearchResultIndex];
              Stage.effects.push(
                new RectangleNoteEffect(
                  new ProgressNumber(0, 50),
                  currentNode.rectangle,
                  Color.Green,
                ),
              );
              // 摄像机对准现在的节点
              Camera.location = currentNode.rectangle.center.clone();
            }}
          >
            下一项
          </Button>
          <Button
            className="m-2"
            onClick={() => {
              setIsSearchingShow(false);
            }}
          >
            关闭
          </Button>
        </Box>
      )}
    </>
  );
}
