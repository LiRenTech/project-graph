import { Color } from "@graphif/data-structures";
import { CaseSensitive, CaseUpper, Search } from "lucide-react";
import React, { useEffect } from "react";
import Box from "../../components/Box";
import Button from "../../components/Button";
import { Dialog } from "../../components/dialog";
import IconButton from "../../components/IconButton";
import Input from "../../components/Input";
import { ViewOutlineFlashEffect } from "../../core/service/feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { Stage } from "../../core/stage/Stage";

export default function SearchingNodePanel() {
  // region 搜索相关
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = React.useState(0);
  const [searchString, setSearchString] = React.useState("");
  const [isCaseSensitive, setIsCaseSensitive] = React.useState(false);

  useEffect(() => {
    if (Stage.contentSearchEngine.searchResultNodes.length == 0) {
      setCurrentSearchResultIndex(-1);
    } else {
      setCurrentSearchResultIndex(Stage.contentSearchEngine.currentSearchResultIndex);
    }
  }, [Stage.contentSearchEngine.currentSearchResultIndex]);

  const [searchResultCount, setSearchResultCount] = React.useState(0);

  useEffect(() => {
    setSearchResultCount(Stage.contentSearchEngine.searchResultNodes.length);
  }, [Stage.contentSearchEngine.searchResultNodes]);

  const search = () => {
    if (searchString == "") {
      this.project.effects.addEffect(ViewOutlineFlashEffect.normal(Color.Red));
      return;
    }
    const isHaveResult = Stage.contentSearchEngine.startSearch(searchString);
    // 搜索完毕
    if (isHaveResult) {
      setCurrentSearchResultIndex(0);
    } else {
      Dialog.show({
        title: "提示",
        type: "info",
        content: "没有找到匹配的节点",
      });
    }
  };

  useEffect(() => {
    // 给输入Input框添加事件监听
    const input = document.querySelector(".search-panel-input") as HTMLInputElement;
    input.focus();

    const keyDownEvent = (event: KeyboardEvent) => {
      if (event.key == "Enter") {
        // console.log(`s[${searchString}]`);
        // setSearchString(input.value);
        // search();
        const searchBtn = document.querySelector(".search-btn") as HTMLInputElement;
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        searchBtn?.dispatchEvent(event);
      }
    };

    input.addEventListener("keydown", keyDownEvent);

    return () => {
      input.removeEventListener("keydown", keyDownEvent);
    };
  }, []);

  // endregion

  return (
    <Box className="bg-panel-bg border-panel-details-text m-1 flex transform flex-col p-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="请输入要搜索的内容"
          className="search-panel-input"
          onChange={(value) => {
            setSearchString(value);
            console.log("value change", value);
          }}
          value={searchString}
        />
        <IconButton className="search-btn ml-2" onClick={search}>
          <Search />
        </IconButton>
        <IconButton
          className="ml-2"
          onClick={() => {
            const currentResult = !isCaseSensitive;
            setIsCaseSensitive(currentResult);
            Stage.contentSearchEngine.isCaseSensitive = currentResult;
          }}
        >
          {isCaseSensitive ? <CaseSensitive /> : <CaseUpper />}
        </IconButton>
      </div>
      <div className="text-panel-details-text flex h-8 items-center justify-center text-xs">
        {isCaseSensitive ? "大小写敏感" : "大小写不敏感"}
      </div>
      <div className="flex items-center justify-center">
        <span>
          {currentSearchResultIndex + 1}/{searchResultCount}
        </span>
        <Button
          className="mx-2"
          onClick={() => {
            Stage.contentSearchEngine.previousSearchResult();
          }}
        >
          上一项
        </Button>
        <Button
          className="mx-2"
          onClick={() => {
            Stage.contentSearchEngine.nextSearchResult();
          }}
        >
          下一项
        </Button>
      </div>
    </Box>
  );
}
