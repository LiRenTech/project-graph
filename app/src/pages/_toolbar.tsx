import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";

import {
  BrainCircuit,
  Brush,
  ClipboardPaste,
  ClipboardX,
  Globe,
  LayoutDashboard,
  MousePointer,
  Package,
  PaintBucket,
  Palette,
  RefreshCcw,
  Repeat,
  SaveAll,
  Slash,
  Square,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import { Popup } from "../components/popup";
import { Color } from "../core/dataStruct/Color";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { TextRiseEffect } from "../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/service/feedbackService/effectEngine/concrete/ViewFlashEffect";
import { LeftMouseModeEnum, Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";
import { openBrowserOrFile } from "../utils/externalOpen";
import { writeTextFile } from "../utils/fs";
import AlignNodePanel from "./_popup_panel/_align_panel";
import ColorPanel from "./_popup_panel/_color_panel";
import GenerateNodePanel from "./_popup_panel/_generate_node_panel";
import { StageNodeConnector } from "../core/stage/stageManager/concreteMethods/StageNodeConnector";
import { StageHistoryManager } from "../core/stage/stageManager/StageHistoryManager";
import { StageGeneratorAI } from "../core/stage/stageManager/concreteMethods/StageGeneratorAI";
import { Panel } from "../components/panel";
import ColorAutoPanel from "./_popup_panel/_color_auto_panel";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
  isHighlight?: boolean;
}

export function ToolbarItem({ icon, handleFunction, description, isHighlight = false }: ToolbarItemProps) {
  return (
    <div
      className="hover:bg-toolbar-icon-hover-bg text-toolbar-tooltip-text group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="bg-toolbar-tooltip-bg border-toolbar-tooltip-border text-toolbar-tooltip-text pointer-events-none absolute bottom-8 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded border p-1 text-xs opacity-0 group-hover:scale-100 group-hover:opacity-100">
        {description}
      </span>
      {isHighlight && <div className="bg-panel-success-text absolute bottom-0 h-1 w-6 rounded-t-md" />}
    </div>
  );
}

const toolBarGroupStyle = "bg-toolbar-bg border-toolbar-border flex items-center rounded-md border";

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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
    <Box className={cn("fixed bottom-2 left-1/2 flex translate-x-[-50%] gap-1.5 border-none", className)}>
      <div className={toolBarGroupStyle}>
        {/* 右键移动画布的用户希望保留此按钮 */}
        <ToolbarItem
          description="删除选中的节点/连线"
          icon={<Trash2 />}
          handleFunction={() => {
            StageManager.deleteSelectedStageObjects();
          }}
        />
        <ToolbarItem
          description="通过文本生成节点"
          icon={<ClipboardPaste />}
          handleFunction={() => Popup.show(<GenerateNodePanel />, true)}
        />
        {isHaveSelectedEdge && (
          <ToolbarItem
            description="反转选中连线方向"
            icon={<Repeat />}
            handleFunction={() => {
              const selectedEdges = StageManager.getLineEdges().filter((edge) => edge.isSelected);
              StageNodeConnector.reverseEdges(selectedEdges);
              StageHistoryManager.recordStep();
            }}
          />
        )}

        <ToolbarItem
          description="设置节点/连线/框的颜色，注意要先选中再点颜色 （F6）"
          icon={<PaintBucket />}
          handleFunction={() => Popup.show(<ColorPanel />, true)}
        />
        <ToolbarItem
          description="设置实体创建时自动填充的颜色"
          icon={<Palette />}
          handleFunction={() => Panel.show({ title: "颜色自动填充" }, <ColorAutoPanel />)}
        />

        <ToolbarItem
          description="节点对齐相关"
          icon={<LayoutDashboard />}
          handleFunction={() => Popup.show(<AlignNodePanel />, true)}
        />
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
          description="将选中节点打包Section（快捷键可自定义）"
          icon={<Square />}
          handleFunction={() => {
            StageManager.packEntityToSectionBySelected();
          }}
        />
        <ToolbarItem
          description="切换Section的折叠状态（快捷键可自定义）（还在开发中，暂时不推荐使用）"
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
            description="AI扩展节点，（已欠费，有待更新）"
            icon={<BrainCircuit />}
            handleFunction={() => {
              StageGeneratorAI.generateNewTextNodeBySelected();
              StageHistoryManager.recordStep();
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
      </div>

      <div className={toolBarGroupStyle}>
        <ToolbarItem
          description="左键：框选和移动模式"
          icon={<MousePointer />}
          handleFunction={() => {
            Stage.drawingMachine.shutDown();
            Stage.leftMouseMode = LeftMouseModeEnum.selectAndMove;
            setIsSelecting(true);
            setIsDrawing(false);
            setIsConnecting(false);
          }}
          isHighlight={isSelecting}
        />
        <ToolbarItem
          description="左键：涂鸦模式"
          icon={<Brush className="rotate-90" />}
          handleFunction={() => {
            Stage.drawingMachine.open();
            Stage.leftMouseMode = LeftMouseModeEnum.draw;
            setIsSelecting(false);
            setIsDrawing(true);
            setIsConnecting(false);
          }}
          isHighlight={isDrawing}
        />
        <ToolbarItem
          description="左键：连接与断开（正在开发中，先用右键）"
          icon={<Slash className="rotate-90" />}
          handleFunction={() => {
            Stage.drawingMachine.open();
            Stage.leftMouseMode = LeftMouseModeEnum.connectAndCut;
            setIsSelecting(false);
            setIsDrawing(false);
            setIsConnecting(true);
          }}
          isHighlight={isConnecting}
        />
      </div>
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
