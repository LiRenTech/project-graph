import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { StageManager } from "../core/stage/stageManager/StageManager";

/**
 * 通过文本来生成节点的面板
 * @returns
 */
export default function GenerateNodePanel() {
  const [inputValue, setInputValue] = useState("");
  const [indention, setIndention] = useState(4);

  return (
    <div className="bg-panel-bg flex flex-col gap-4 rounded-lg p-2">
      <Input value={inputValue} onChange={setInputValue} multiline />
      <div>
        <span className="text-panel-text">缩进数量</span>
        <Input value={indention.toString()} onChange={setIndention} number />
        <p className="text-panel-details-text text-xs">会按照您的缩进等级来生成对应的节点结构</p>
      </div>
      <Button
        onClick={() => {
          StageManager.generateNodeByText(inputValue, indention);
          setInputValue("");
        }}
      >
        生成纯文本节点
      </Button>
      <Button
        onClick={() => {
          StageManager.generateNodeByMarkdown(inputValue);
          setInputValue("");
        }}
      >
        根据markdown生成节点
      </Button>
    </div>
  );
}
