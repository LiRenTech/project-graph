import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { isExportTreeTextPanelOpenAtom } from "../state";
import { cn } from "../utils/cn";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { TextNode } from "../core/stageObject/entity/TextNode";
import Button from "../components/ui/Button";

/**
 * 导出节点纯文本相关的面板
 * 树形的
 */
export default function ExportTreeTextPanel() {
  const [isExportTreeTextPanelOpen, setIsExportTreeTextPanelOpen] =
    useRecoilState(isExportTreeTextPanelOpenAtom);

  const [markdownText, setMarkdownText] = useState("");
  const [tabText, setTabText] = useState("");

  useEffect(() => {
    if (!isExportTreeTextPanelOpen) {
      return;
    }
    // 当前选择的节点通常来说是一个节点，且在上游已经确定了是树形结构
    const selectedNode = StageManager.getSelectedEntities()[0];
    if (!(selectedNode instanceof TextNode)) {
      return;
    }

    setMarkdownText(StageSaveManager.getMarkdownStringByTextNode(selectedNode));
    setTabText(StageSaveManager.getTabStringByTextNode(selectedNode));
  }, [isExportTreeTextPanelOpen]);

  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-y-scroll rounded-md bg-gray-800 px-2 py-6",
        {
          hidden: !isExportTreeTextPanelOpen,
        },
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <h2 className="text-lg font-bold">导出节点纯文本</h2>
      <div className="flex gap-2">
        <CodePre text={tabText} title="纯缩进类型" />
        <CodePre text={markdownText} title="markdown类型" />
      </div>
      <button
        className="absolute right-0 top-0 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        onClick={() => setIsExportTreeTextPanelOpen(false)}
      >
        关闭
      </button>
    </div>
  );
}

function CodePre({ text, title }: { text: string; title: string }) {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("内容已复制到剪贴板！");
      })
      .catch((err) => {
        alert("复制失败:" + err.toString());
      });
  };

  return (
    <div>
      <h4 className="text-sm font-bold">{title}</h4>
      <Button onClick={handleCopy}>点击复制</Button>
      <pre className="select-text rounded-md bg-black p-2 text-xs text-slate-400">
        {text}
      </pre>
    </div>
  );
}
