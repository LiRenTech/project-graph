import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { isExportTreeTextPanelOpenAtom } from "../state";
import { cn } from "../utils/cn";
import { Stage } from "../core/stage/Stage";

/**
 * 导出节点纯文本相关的面板
 * 树形的
 */
export default function ExportTreeTextPanel() {
  const [isExportTreeTextPanelOpen, setIsExportTreeTextPanelOpen] = useAtom(
    isExportTreeTextPanelOpenAtom,
  );

  const [markdownText, setMarkdownText] = useState("");
  const [tabText, setTabText] = useState("");
  const [plainText, setPlainText] = useState("");

  useEffect(() => {
    if (!isExportTreeTextPanelOpen) {
      return;
    }
    const selectedEntities = StageManager.getSelectedEntities();
    if (selectedEntities.length === 0) {
      // 没有选中节点
      setMarkdownText("请选择一个节点\n且必须是树形结构的根节点");
      setTabText("请选择一个节点\n且必须是树形结构的根节点");
      setPlainText("请选择多个节点");
    } else if (selectedEntities.length === 1) {
      // 单个节点
      const selectedFirstNode = selectedEntities[0];
      if (selectedFirstNode instanceof TextNode) {
        if (StageManager.isTree(selectedFirstNode)) {
          setMarkdownText(
            Stage.exportEngine.getMarkdownStringByTextNode(selectedFirstNode),
          );
          setTabText(
            Stage.exportEngine.getTabStringByTextNode(selectedFirstNode),
          );
        } else {
          setMarkdownText("选择的根节点必须符合树形结构");
          setTabText("选择的根节点必须符合树形结构");
        }
      }
      setPlainText("请选择多个节点");
    } else {
      // 多个节点
      setMarkdownText("只能选择一个节点\n且必须是树形结构的根节点");
      setTabText("只能选择一个节点\n且必须是树形结构的根节点");
      setPlainText(Stage.exportEngine.getPlainTextByEntities(selectedEntities));
    }
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
      <h2 className="my-2 text-2xl font-bold">导出节点纯文本</h2>
      <div className="flex gap-2">
        <CodePre
          text={tabText}
          title="纯缩进类型"
          details="树形结构，以缩进方式展示节点内容"
        />
        <CodePre
          text={markdownText}
          title="markdown类型"
          details="树形结构，以markdown方式展示节点内容"
        />
        <CodePre
          text={plainText}
          title="纯文本图类型"
          details="图形结构，上面是节点，下面是连接关系"
        />
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

function CodePre({
  text,
  title,
  details,
}: {
  text: string;
  title: string;
  details: string;
}) {
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
      <h4 className="text-center font-bold">{title}</h4>
      <p className="text-center text-xs text-gray-500">{details}</p>
      <Button onClick={handleCopy}>点击复制</Button>
      <pre className="max-h-96 max-w-96 select-text overflow-x-auto rounded-md bg-black p-2 text-xs text-slate-400">
        {text}
      </pre>
    </div>
  );
}
