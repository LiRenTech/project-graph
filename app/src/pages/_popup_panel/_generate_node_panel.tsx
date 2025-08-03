import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTransferEngine } from "@/core/service/dataGenerateService/dataTransferEngine/dataTransferEngine";
import { StageManager } from "@/core/stage/stageManager/StageManager";
import { useEffect, useState } from "react";

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
      <div className="flex flex-nowrap justify-between gap-2">
        <Button
          onClick={() => {
            StageManager.generateNodeGraphByText(inputValue);
            setInputValue("");
          }}
        >
          根据纯文本生成网结构
        </Button>
        <Button
          onClick={() => {
            Dialog.show({
              title: "帮助",
              content: "网状格式和“导出为纯文本-网状格式”相同，详见官网",
            });
          }}
        >
          疑问
        </Button>
      </div>
      <div>
        <span className="text-panel-text">缩进数量</span>
        <Input value={indention.toString()} onChange={onInputChange} number />
        <p className="text-panel-details-text text-xs">会按照您的缩进等级来生成对应的树形结构</p>
      </div>
      <Button
        onClick={() => {
          if (inputValue.trim() === "") {
            Dialog.show({
              title: "提示",
              type: "warning",
              content: "请在文本输入框中粘贴缩进格式的文本内容",
            });
            return;
          }
          StageManager.generateNodeTreeByText(inputValue, indention);
          setInputValue("");
        }}
      >
        根据纯文本生成树结构
      </Button>
      <div className="flex flex-nowrap justify-between gap-2">
        <Button
          className="flex-1"
          onClick={() => {
            if (inputValue.trim() === "") {
              Dialog.show({
                title: "提示",
                type: "warning",
                content: "请在文本输入框中粘贴markdown格式字符串",
              });
              return;
            }
            StageManager.generateNodeByMarkdown(inputValue);
            setInputValue("");
          }}
        >
          根据markdown文本内容生成树结构
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
            if (inputValue.trim() === "") {
              Dialog.show({
                title: "提示",
                type: "warning",
                content: "请在文本输入框中粘贴content.json的内容",
              });
              return;
            }
            const indent4 = DataTransferEngine.xmindToString(JSON.parse(inputValue));
            StageManager.generateNodeTreeByText(indent4, 4);
            setInputValue("");
          }}
        >
          根据xmind中的content.json生成树结构
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
