import React, { useEffect } from "react";
import Box from "../components/ui/Box";
import Button from "../components/ui/Button";
import { Controller } from "../core/service/controller/Controller";
import { Stage } from "../core/stage/Stage";
import { Dialog } from "../utils/dialog";

export default function SearchingNodePanel() {
  // region 搜索相关
  const [isSearchingShow, setIsSearchingShow] = React.useState(false);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] =
    React.useState(0);

  useEffect(() => {
    if (Stage.contentSearchEngine.searchResultNodes.length == 0) {
      setCurrentSearchResultIndex(-1);
    } else {
      setCurrentSearchResultIndex(
        Stage.contentSearchEngine.currentSearchResultIndex,
      );
    }
  }, [Stage.contentSearchEngine.currentSearchResultIndex]);

  const [searchResultCount, setSearchResultCount] = React.useState(0);
  useEffect(() => {
    setSearchResultCount(Stage.contentSearchEngine.searchResultNodes.length);
  }, [Stage.contentSearchEngine.searchResultNodes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Controller.pressingKeySet.has("control") && event.key === "f") {
        Controller.pressingKeySet.clear();
        const searchString = prompt("请输入要搜索的节点名称");
        if (searchString) {
          const isHaveResult =
            Stage.contentSearchEngine.startSearch(searchString);
          // 搜索完毕
          if (isHaveResult) {
            setIsSearchingShow(true);
            setCurrentSearchResultIndex(0);
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
              Stage.contentSearchEngine.previousSearchResult();
            }}
          >
            上一项
          </Button>
          <Button
            className="m-2"
            onClick={() => {
              Stage.contentSearchEngine.nextSearchResult();
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
