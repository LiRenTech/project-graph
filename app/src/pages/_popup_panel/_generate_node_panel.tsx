import { useEffect, useState } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { DataTransferEngine } from "../../core/service/dataGenerateService/dataTransferEngine/dataTransferEngine";
import { Dialog } from "../../components/dialog";
import { Settings } from "../../core/service/Settings";

/**
 * 通过文本来生成节点的面板
 * @returns
 */
export default function GenerateNodePanel() {
  const [inputValue, setInputValue] = useState("");
  const [indention, setIndention] = useState(4);

  useEffect(() => {
    Settings.get("generateTextNodeByStringTabCount").then((indent) => {
      setIndention(indent);
    });
  }, []);

  function onInputChange(value: number) {
    Settings.set("generateTextNodeByStringTabCount", value);
    setIndention(value);
  }

  return (
    <div className="bg-panel-bg flex flex-col gap-4 rounded-lg p-2">
      <Input value={inputValue} onChange={setInputValue} placeholder="在此输入纯文本内容，后点击下方按钮" multiline />
      <div>
        <span className="text-panel-text">缩进数量</span>
        <Input value={indention.toString()} onChange={onInputChange} number />
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
      <div className="flex flex-nowrap justify-between gap-2">
        <Button
          className="flex-1"
          onClick={() => {
            StageManager.generateNodeByMarkdown(inputValue);
            setInputValue("");
          }}
        >
          根据markdown生成节点
        </Button>
        <Button
          onClick={() => {
            Dialog.show({
              title: "帮助",
              content: "导入markdown格式和操作详见官网文档",
            });
          }}
        >
          疑问
        </Button>
      </div>

      <div className="flex flex-nowrap justify-between gap-2">
        <Button
          className="flex-1 text-xs"
          onClick={() => {
            const indent4 = DataTransferEngine.xmindToString(JSON.parse(inputValue));
            StageManager.generateNodeByText(indent4, 4);
            setInputValue("");
          }}
        >
          根据xmind中的content.json生成节点
        </Button>
        <Button
          onClick={() => {
            Dialog.show({
              title: "帮助",
              content: "1，将xmind后缀名改成zip\n2，找到内部的content.json\n3，打开json，将json内容复制到输入框中",
            });
          }}
        >
          疑问
        </Button>
      </div>
    </div>
  );
}
