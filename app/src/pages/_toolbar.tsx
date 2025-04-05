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
  Palette,
  Pencil,
  RefreshCcw,
  Repeat,
  SaveAll,
  Square,
  Tag,
  Trash2,
  Waypoints,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import { Panel } from "../components/panel";
import { Popup } from "../components/popup";
import { Color } from "../core/dataStruct/Color";
import { Settings } from "../core/service/Settings";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { TextRiseEffect } from "../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/service/feedbackService/effectEngine/concrete/ViewFlashEffect";
import { StageStyleManager } from "../core/service/feedbackService/stageStyle/StageStyleManager";
import { LeftMouseModeEnum, Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageHistoryManager } from "../core/stage/stageManager/StageHistoryManager";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { StageGeneratorAI } from "../core/stage/stageManager/concreteMethods/StageGeneratorAI";
import { StageNodeConnector } from "../core/stage/stageManager/concreteMethods/StageNodeConnector";
import { cn } from "../utils/cn";
import { openBrowserOrFile } from "../utils/externalOpen";
import { writeTextFile } from "../utils/fs";
import { isMac } from "../utils/platform";
import AlignNodePanel from "./_popup_panel/_align_panel";
import ColorAutoPanel from "./_popup_panel/_color_auto_panel";
import ColorPanel from "./_popup_panel/_color_panel";
import GenerateNodePanel from "./_popup_panel/_generate_node_panel";
import { StageObjectSelectCounter } from "../core/stage/stageManager/concreteMethods/StageObjectSelectCounter";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
  // isHighlight?: boolean;
  color?: Color; // 定义 color 的类型
}

export function ToolbarItem({ icon, handleFunction, description, color = Color.Transparent }: ToolbarItemProps) {
  return (
    <div
      className="hover:bg-toolbar-icon-hover-bg text-toolbar-tooltip-text group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="bg-toolbar-tooltip-bg border-toolbar-tooltip-border text-toolbar-tooltip-text pointer-events-none absolute bottom-8 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded border p-1 text-xs opacity-0 group-hover:scale-100 group-hover:opacity-100">
        {description}
      </span>
      {/* {isHighlight && <div className="bg-panel-success-text absolute top-0 h-1 w-6 rounded-b-md" />} */}
      {color && color.a !== 0 && (
        <div
          className={"border-toolbar-border absolute bottom-1 left-1 h-2 w-1 rounded-full"}
          style={{ backgroundColor: color.toString(), outline: "1px solid", outlineColor: "bg-toolbar-border" }}
        ></div>
      )}
    </div>
  );
}

const toolBarGroupStyle = "bg-toolbar-bg border-toolbar-border flex items-center rounded-md border";

interface PenItemProps {
  color: Color;
}

/**
 * 笔触点儿
 * @returns
 */
export function PenItem({ color }: PenItemProps) {
  if (color.a === 0) {
    return (
      <div
        className="group relative mx-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs outline-1 transition-all hover:scale-125"
        style={{
          backgroundColor: StageStyleManager.currentStyle.StageObjectBorder.toString(),
          color: StageStyleManager.currentStyle.Background.toString(),
          outlineColor: StageStyleManager.currentStyle.StageObjectBorder.toString(),
        }}
        onClick={() => {
          Settings.set("autoFillPenStrokeColorEnable", true);
          Settings.set("autoFillPenStrokeColor", color.toArray());
        }}
      >
        <span className="bg-tooltip-bg text-tooltip-text border-tooltip-border absolute -top-6 flex h-6 w-48 items-center justify-center rounded-md border-2 text-xs opacity-0 transition-all group-hover:opacity-100">
          跟随主题切换的默认边框色
        </span>
        A
      </div>
    );
  }
  return (
    <div
      className="mx-0.5 h-4 w-4 cursor-pointer rounded-full outline-1 transition-all hover:scale-125"
      style={{
        backgroundColor: color.toString(),
        outlineColor: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      }}
      onClick={async () => {
        //
        Settings.set("autoFillPenStrokeColorEnable", true);
        Settings.set("autoFillPenStrokeColor", color.toArray());
      }}
    >
      {isMac && <span>.</span>}
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
  const [isHaveSelectedStageObject, setIsHaveSelectedStageObject] = useState(false);
  const [isHaveSelectedEntity, setIsHaveSelectedEntity] = useState(false);
  const [isHaveSelectedImageNode, setIsHaveSelectedImageNode] = useState(false);
  const [isHaveSelectedTextNode, setIsHaveSelectedTextNode] = useState(false);
  const [isHaveSelectedSection, setIsHaveSelectedSection] = useState(false);
  const [isHaveSelectedEdge, setIsHaveSelectedEdge] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [penStrokeColor, setPenStrokeColor] = useState(Color.Transparent);
  const [nodeFillColor, setNodeFillColor] = useState(Color.Transparent);

  const update = () => {
    setIsHaveSelectedEntity(StageObjectSelectCounter.selectedEntityCount > 0);
    setIsHaveSelectedEdge(StageObjectSelectCounter.selectedEdgeCount > 0);
    setIsHaveSelectedStageObject(
      StageObjectSelectCounter.selectedEdgeCount + StageObjectSelectCounter.selectedEntityCount > 0,
    );
    setIsHaveSelectedImageNode(StageObjectSelectCounter.selectedImageNodeCount > 0);
    setIsHaveSelectedTextNode(StageObjectSelectCounter.selectedTextNodeCount > 0);
    setIsHaveSelectedSection(StageObjectSelectCounter.selectedSectionCount > 0);
    setIsCopyClearShow(!CopyEngine.isVirtualClipboardEmpty());
  };

  const selectSelectingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.selectAndMove;
    setIsSelecting(true);
    setIsDrawing(false);
    setIsConnecting(false);
  };
  const selectDrawingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.draw;
    setIsSelecting(false);
    setIsDrawing(true);
    setIsConnecting(false);
  };
  const selectConnectingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.connectAndCut;
    setIsSelecting(false);
    setIsDrawing(false);
    setIsConnecting(true);
  };

  useEffect(() => {
    update();
    const intervalId = setInterval(() => {
      update();
    }, 100);
    Stage.MouseModeManager.checkoutSelectAndMoveHook = selectSelectingMouse;
    Stage.MouseModeManager.checkoutDrawingHook = selectDrawingMouse;
    Stage.MouseModeManager.checkoutConnectAndCuttingHook = selectConnectingMouse;
    if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      selectDrawingMouse();
    } else if (Stage.leftMouseMode === LeftMouseModeEnum.selectAndMove) {
      selectSelectingMouse();
    } else if (Stage.leftMouseMode === LeftMouseModeEnum.connectAndCut) {
      selectConnectingMouse();
    }

    Settings.watch("autoFillPenStrokeColor", (colorList) => {
      setPenStrokeColor(new Color(...colorList));
    });
    Settings.watch("autoFillNodeColor", (colorList) => {
      setNodeFillColor(new Color(...colorList));
    });
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
      {/* 常驻工具 */}
      <div className={toolBarGroupStyle}>
        <ToolbarItem
          description="通过文本生成节点"
          icon={<ClipboardPaste />}
          handleFunction={() => Popup.show(<GenerateNodePanel />, true)}
        />
        <ToolbarItem
          description="设置实体创建时自动填充的颜色"
          icon={<Palette />}
          handleFunction={() => Panel.show({ title: "颜色自动填充" }, <ColorAutoPanel />)}
        />
      </div>
      {/* 特殊情况的工具 */}
      {isClipboardClearShow && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="清空粘贴板内容"
            icon={<ClipboardX />}
            handleFunction={() => {
              CopyEngine.clearVirtualCopyBoardData();
            }}
          />
        </div>
      )}

      {/* 舞台对象 */}
      {isHaveSelectedStageObject && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="设置舞台对象的颜色，注意要先选中再点颜色 （F6）"
            icon={<PaintBucket />}
            handleFunction={() => Popup.show(<ColorPanel />, true)}
          />
          <ToolbarItem
            description="删除选中的舞台对象"
            icon={<Trash2 />}
            handleFunction={() => {
              StageManager.deleteSelectedStageObjects();
            }}
          />
          <ToolbarItem
            description="给舞台对象添加标签，如果已添加则去除标签"
            icon={<Tag />}
            handleFunction={() => {
              StageManager.addTagBySelected();
            }}
          />
        </div>
      )}

      {/* 连线对象 */}
      {isHaveSelectedEdge && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="反转选中连线方向"
            icon={<Repeat />}
            handleFunction={() => {
              const selectedEdges = StageManager.getLineEdges().filter((edge) => edge.isSelected);
              StageNodeConnector.reverseEdges(selectedEdges);
              StageHistoryManager.recordStep();
            }}
          />
        </div>
      )}

      {/* 实体 */}
      {isHaveSelectedEntity && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="节点对齐相关"
            icon={<LayoutDashboard />}
            handleFunction={() => Popup.show(<AlignNodePanel />, true)}
          />
          <ToolbarItem
            description="将选中的节点保存为新文件"
            icon={<SaveAll />}
            handleFunction={() => {
              onSaveSelectedNew();
            }}
          />
          <ToolbarItem
            description="将选中节点打包Section（快捷键可自定义）"
            icon={<Square />}
            handleFunction={() => {
              StageManager.packEntityToSectionBySelected();
            }}
          />
        </div>
      )}

      {/* 图片节点 */}
      {isHaveSelectedImageNode && (
        <ToolbarItem
          description="刷新选中内容(图片加载失败了可以选中图片然后点这个按钮)"
          icon={<RefreshCcw />}
          handleFunction={() => {
            StageManager.refreshSelected();
          }}
        />
      )}

      {/* 文本节点 */}
      {isHaveSelectedTextNode && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="AI扩展节点，（已欠费，有待更新）"
            icon={<BrainCircuit />}
            handleFunction={() => {
              StageGeneratorAI.generateNewTextNodeBySelected();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description="将选中的节点的内容作为网页链接或本地文件路径打开"
            icon={<Globe />}
            handleFunction={async () => {
              // 打开文件或网页
              openBrowserOrFile();
            }}
          />
        </div>
      )}

      {/* 框 */}
      {isHaveSelectedSection && (
        <div className={toolBarGroupStyle}>
          <ToolbarItem
            description="切换Section的折叠状态（快捷键可自定义）（还在开发中，暂时不推荐使用）"
            icon={<Package />}
            handleFunction={() => {
              StageManager.sectionSwitchCollapse();
            }}
          />
        </div>
      )}

      {/* 鼠标模式 */}
      <div className={toolBarGroupStyle}>
        <ToolbarItem
          description="左键：框选/移动/创建节点 模式"
          icon={<MousePointer className={cn(isSelecting ? "opacity-100" : "opacity-25")} />}
          handleFunction={() => {
            selectSelectingMouse();
          }}
          color={nodeFillColor}
        />
        <ToolbarItem
          description="左键：涂鸦模式"
          icon={<Pencil className={cn(isDrawing ? "opacity-100" : "opacity-25", "rotate-90")} />}
          handleFunction={() => {
            selectDrawingMouse();
          }}
          color={penStrokeColor}
        />
        <ToolbarItem
          description="左键：连接/斩断 模式"
          icon={<Waypoints className={cn(isConnecting ? "opacity-100" : "opacity-25")} />}
          handleFunction={() => {
            selectConnectingMouse();
          }}
        />
      </div>

      {/* 涂鸦笔触颜色 */}
      {isDrawing && (
        <div className={toolBarGroupStyle}>
          <PenItem color={Color.Transparent} />
          <PenItem color={Color.Green} />
          <PenItem color={Color.Red} />
          <PenItem color={Color.Blue} />
          <PenItem color={Color.Yellow} />
          <PenItem color={Color.Cyan} />
          <PenItem color={Color.Magenta} />
        </div>
      )}
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
