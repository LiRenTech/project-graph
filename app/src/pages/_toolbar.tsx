import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";

import {
  BrainCircuit,
  ClipboardPaste,
  ClipboardX,
  Globe,
  LayoutDashboard,
  MousePointer,
  Package,
  PaintBucket,
  PenTool,
  RefreshCcw,
  Repeat,
  SaveAll,
  Square,
  Tag,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import { Dialog } from "../components/dialog";
import { Popup } from "../components/popup";
import { Color } from "../core/dataStruct/Color";
import { StageExportSvg } from "../core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { TextRiseEffect } from "../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/service/feedbackService/effectEngine/concrete/ViewFlashEffect";
import { Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";
import { openBrowserOrFile } from "../utils/externalOpen";
import { writeTextFile } from "../utils/fs";
import AlignNodePanel from "./_popup_panel/_align_panel";
import ColorPanel from "./_popup_panel/_color_panel";
import GenerateNodePanel from "./_popup_panel/_generate_node_panel";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
}

export function ToolbarItem({ icon, handleFunction, description }: ToolbarItemProps) {
  return (
    <div
      className="hover:bg-toolbar-icon-hover-bg text-toolbar-tooltip-text group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="bg-toolbar-tooltip-bg border-toolbar-tooltip-border text-toolbar-tooltip-text pointer-events-none absolute bottom-8 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded border p-1 text-xs opacity-0 group-hover:scale-100 group-hover:opacity-100">
        {description}
      </span>
    </div>
  );
}

/**
 * 工具栏
 * @param param0
 * @returns
 */
export default function Toolbar({ className = "" }: { className?: string }) {
  // 是否显示清空粘贴板
  const [isClipboardClearShow, setIsCopyClearShow] = useState(false);
  const [isHaveSelectedNode, setSsHaveSelectedNode] = useState(false);
  const [isHaveSelectedEdge, setSsHaveSelectedEdge] = useState(false);

  const update = () => {
    setSsHaveSelectedNode(StageManager.selectedNodeCount > 0);
    setSsHaveSelectedEdge(StageManager.selectedEdgeCount > 0);
    setIsCopyClearShow(!CopyEngine.isVirtualClipboardEmpty());
  };
  useEffect(() => {
    update();
    const intervalId = setInterval(() => {
      update();
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 一个竖向的工具栏，在页面顶部，右侧显示
  // z-index: 40; 不写成最大的50，
  // 因为报错窗口可能会被它遮挡住导致无法在右上角关闭报错窗口

  // 以后适配安卓的时候再解决工具栏过小的问题
  return (
    <Box
      className={cn("bg-toolbar-bg border-toolbar-border fixed bottom-2 left-1/2 flex translate-x-[-50%]", className)}
    >
      <ToolbarItem
        description="通过文本生成节点"
        icon={<ClipboardPaste />}
        handleFunction={() => Popup.show(<GenerateNodePanel />)}
      />
      {isHaveSelectedEdge && (
        <ToolbarItem
          description="反转选中连线方向"
          icon={<Repeat />}
          handleFunction={() => {
            const selectedEdges = StageManager.getLineEdges().filter((edge) => edge.isSelected);
            StageManager.reverseEdges(selectedEdges);
          }}
        />
      )}

      <ToolbarItem
        description="设置节点/连线/框的颜色，注意要先选中再点颜色"
        icon={<PaintBucket />}
        handleFunction={() => Popup.show(<ColorPanel />)}
      />

      {isHaveSelectedNode && (
        <ToolbarItem
          description="节点对齐相关"
          icon={<LayoutDashboard />}
          handleFunction={() => Popup.show(<AlignNodePanel />)}
        />
      )}
      {isClipboardClearShow && (
        <ToolbarItem
          description="清空粘贴板内容"
          icon={<ClipboardX />}
          handleFunction={() => {
            CopyEngine.clearVirtualCopyBoardData();
          }}
        />
      )}
      {isHaveSelectedNode && (
        <ToolbarItem
          description="将选中的节点的内容作为网页链接或本地文件路径打开"
          icon={<Globe />}
          handleFunction={async () => {
            // 打开文件或网页
            openBrowserOrFile();
          }}
        />
      )}
      {isHaveSelectedNode && (
        <ToolbarItem
          description="将选中的节点保存为新文件"
          icon={<SaveAll />}
          handleFunction={() => {
            onSaveSelectedNew();
          }}
        />
      )}
      <ToolbarItem
        description="将选中节点打包Section（快捷键可自定义）（Section目前bug较多，还在开发中，暂时不推荐使用）"
        icon={<Square />}
        handleFunction={() => {
          StageManager.packEntityToSectionBySelected();
        }}
      />
      <ToolbarItem
        description="切换Section的折叠状态（快捷键可自定义）"
        icon={<Package />}
        handleFunction={() => {
          StageManager.sectionSwitchCollapse();
        }}
      />
      {isHaveSelectedNode && (
        <ToolbarItem
          description="添加标签，如果已添加则去除标签"
          icon={<Tag />}
          handleFunction={() => {
            StageManager.addTagBySelected();
          }}
        />
      )}
      {isHaveSelectedNode && (
        <ToolbarItem
          description="AI扩展节点"
          icon={<BrainCircuit />}
          handleFunction={() => {
            StageManager.expandTextNodeByAI();
          }}
        />
      )}
      {isHaveSelectedNode && (
        <ToolbarItem
          description="将选中内容导出SVG"
          icon={<SaveAll />}
          handleFunction={() => {
            const svgString = StageExportSvg.dumpSelectedToSVGString();
            Dialog.show({
              title: "导出SVG",
              content:
                "SVG的本质是一堆标签代码，如果您是在写markdown格式的博客，可以直接把下面的标签代码粘贴在您的文章中。如果您想保存成文件，可以把这段代码复制到txt中并改后缀名成svg",
              code: svgString,
              type: "info",
            });
          }}
        />
      )}
      <ToolbarItem
        description="刷新选中内容(图片加载失败了可以选中图片然后点这个按钮)"
        icon={<RefreshCcw />}
        handleFunction={() => {
          StageManager.refreshSelected();
        }}
      />
      <ToolbarItem
        description="切换涂鸦和鼠标"
        icon={Stage.drawingMachine.isUsing ? <PenTool /> : <MousePointer />}
        handleFunction={() => {
          if (Stage.drawingMachine.isUsing) {
            Stage.drawingMachine.shutDown();
          } else {
            Stage.drawingMachine.open();
          }
        }}
      />
    </Box>
  );
}

const onSaveSelectedNew = async () => {
  const path = await saveFileDialog({
    title: "另存为",
    defaultPath: "新文件.json", // 提供一个默认的文件名
    filters: [
      {
        name: "Project Graph",
        extensions: ["json"],
      },
    ],
  });

  if (!path) {
    return;
  }

  try {
    const selectedNodes = [];
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        selectedNodes.push(node);
      }
    }
    const data = StageDumper.dumpSelected(selectedNodes);
    writeTextFile(path, JSON.stringify(data))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_) => {
        Stage.effectMachine.addEffect(new ViewFlashEffect(Color.Black));
      })
      .catch((err) => {
        Stage.effectMachine.addEffect(new TextRiseEffect("保存失败" + err));
      });
  } catch (e) {
    Stage.effectMachine.addEffect(new TextRiseEffect("保存失败" + e));
  }
};
