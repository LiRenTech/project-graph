import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";

import {
  BrainCircuit,
  ChevronsLeftRightEllipsis,
  ChevronsRightLeft,
  ClipboardPaste,
  ClipboardX,
  FolderSymlink,
  GitBranchPlus,
  LayoutDashboard,
  MousePointer,
  Package,
  PaintBucket,
  Palette,
  Pencil,
  RefreshCcw,
  Repeat,
  SaveAll,
  Shrink,
  Spline,
  Square,
  Tag,
  Trash2,
  Waypoints,
  WrapText,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import { Panel } from "../components/panel";
import { Popup } from "../components/popup";
import { Color } from "../core/dataStruct/Color";
import { Vector } from "../core/dataStruct/Vector";
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
import { StageObjectSelectCounter } from "../core/stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { cn } from "../utils/cn";
import { openBrowserOrFile, openSelectedImageNode } from "../utils/externalOpen";
import { writeTextFile } from "../utils/fs";
import { isMac } from "../utils/platform";
import AlignNodePanel from "./_popup_panel/_align_panel";
import ColorAutoPanel from "./_popup_panel/_color_auto_panel";
import ColorPanel from "./_popup_panel/_color_panel";
import GenerateNodePanel from "./_popup_panel/_generate_node_panel";
import EdgeExtremePointPanel from "./_popup_panel/_edge_extreme_point_panel";

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

interface PenItemProps {
  color: Color;
}

interface ToolbarGroupProps {
  children: React.ReactNode;
  groupTitle: string;
}

interface ToolbarSelectGroupProps {
  children: React.ReactNode;
  groupTitle: string;
  currentSelectIndex: number;
}

const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children, groupTitle }) => {
  return (
    <div className="bg-toolbar-bg border-toolbar-border relative flex items-center rounded-md border">
      {children}
      <span className="text-toolbar-border absolute -top-3.5 left-0 text-center" style={{ fontSize: "9px" }}>
        {groupTitle}
      </span>
    </div>
  );
};

const ToolbarSelectGroup: React.FC<ToolbarSelectGroupProps> = ({ children, groupTitle, currentSelectIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(currentSelectIndex);
  }, [currentSelectIndex]);

  return (
    <div className="bg-toolbar-bg border-toolbar-border relative flex items-center rounded-md border">
      {/* 选中的高亮背景 */}
      <span
        className={cn("bg-toolbar-selected-item-bg absolute h-full w-8 rounded-md transition-all")}
        style={{
          left: `${currentIndex * 8 * 4}px`,
        }}
      ></span>
      {children}
      <span className="text-toolbar-border absolute -top-3.5 left-0 text-center" style={{ fontSize: "9px" }}>
        {groupTitle}
      </span>
    </div>
  );
};

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
  const [isHaveSelectedCREdge, setIsHaveSelectedCREdge] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penStrokeColor, setPenStrokeColor] = useState(Color.Transparent);
  const [nodeFillColor, setNodeFillColor] = useState(Color.Transparent);

  const update = () => {
    setIsHaveSelectedEntity(StageObjectSelectCounter.selectedEntityCount > 0);
    setIsHaveSelectedEdge(StageObjectSelectCounter.selectedEdgeCount > 0);
    setIsHaveSelectedCREdge(StageObjectSelectCounter.selectedCREdgeCount > 0);
    setIsHaveSelectedStageObject(StageObjectSelectCounter.selectedStageObjectCount > 0);
    setIsHaveSelectedImageNode(StageObjectSelectCounter.selectedImageNodeCount > 0);
    setIsHaveSelectedTextNode(StageObjectSelectCounter.selectedTextNodeCount > 0);
    setIsHaveSelectedSection(StageObjectSelectCounter.selectedSectionCount > 0);
    setIsCopyClearShow(!CopyEngine.isVirtualClipboardEmpty());
  };

  const [currentMouseModeIndex, setCurrentMouseModeIndex] = useState(0);

  const selectSelectingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.selectAndMove;
    setIsDrawing(false);
    setCurrentMouseModeIndex(0);
  };
  const selectDrawingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.draw;
    setIsDrawing(true);
    setCurrentMouseModeIndex(1);
  };
  const selectConnectingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.connectAndCut;
    setIsDrawing(false);
    setCurrentMouseModeIndex(2);
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
      <ToolbarGroup groupTitle="常驻工具">
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
      </ToolbarGroup>
      {/* 特殊情况的工具 */}
      {isClipboardClearShow && (
        <ToolbarGroup groupTitle="特殊情况的工具">
          <ToolbarItem
            description="清空粘贴板内容"
            icon={<ClipboardX />}
            handleFunction={() => {
              CopyEngine.clearVirtualCopyBoardData();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 舞台对象 */}
      {isHaveSelectedStageObject && (
        <ToolbarGroup groupTitle="对象">
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
        </ToolbarGroup>
      )}

      {/* 连线对象 */}
      {isHaveSelectedEdge && (
        <ToolbarGroup groupTitle="有向边">
          <ToolbarItem
            description="反转选中连线方向"
            icon={<Repeat />}
            handleFunction={() => {
              const selectedEdges = StageManager.getLineEdges().filter((edge) => edge.isSelected);
              StageNodeConnector.reverseEdges(selectedEdges);
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description="切换为CR曲线"
            icon={<Spline />}
            handleFunction={() => {
              StageManager.switchLineEdgeToCrEdge();
              StageHistoryManager.recordStep();
            }}
          />

          <ToolbarItem
            description="设置选中连线的端点位置"
            icon={<Shrink className="rotate-45" />}
            handleFunction={() => Popup.show(<EdgeExtremePointPanel />, true)}
          />
        </ToolbarGroup>
      )}

      {/* CR曲线 */}
      {isHaveSelectedCREdge && (
        <ToolbarGroup groupTitle="CR曲线">
          <ToolbarItem
            description="增加控制点"
            icon={<GitBranchPlus />}
            handleFunction={() => {
              StageManager.addSelectedCREdgeControlPoint();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description="拉紧曲线"
            icon={<ChevronsRightLeft />}
            handleFunction={() => {
              StageManager.addSelectedCREdgeTension();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description="放松曲线"
            icon={<ChevronsLeftRightEllipsis />}
            handleFunction={() => {
              StageManager.reduceSelectedCREdgeTension();
              StageHistoryManager.recordStep();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 实体 */}
      {isHaveSelectedEntity && (
        <ToolbarGroup groupTitle="实体">
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
        </ToolbarGroup>
      )}

      {/* 图片节点 */}
      {isHaveSelectedImageNode && (
        <ToolbarGroup groupTitle="图片">
          <ToolbarItem
            description="刷新选中内容(图片加载失败了可以选中图片然后点这个按钮)"
            icon={<RefreshCcw />}
            handleFunction={() => {
              StageManager.refreshSelected();
            }}
          />
          <ToolbarItem
            description="打开选中的图片"
            icon={<FolderSymlink />}
            handleFunction={() => {
              openSelectedImageNode();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 文本节点 */}
      {isHaveSelectedTextNode && (
        <ToolbarGroup groupTitle="文本节点">
          <ToolbarItem
            description="切换宽度调整策略（ttt）"
            icon={<WrapText />}
            handleFunction={() => {
              const selectedTextNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
              for (const node of selectedTextNodes) {
                if (node.sizeAdjust === "auto") {
                  node.sizeAdjust = "manual";
                  node.resizeHandle(Vector.getZero());
                } else if (node.sizeAdjust === "manual") {
                  node.sizeAdjust = "auto";
                  node.forceAdjustSizeByText();
                }
              }
            }}
          />
          <ToolbarItem
            description="将内容视为本地绝对路径，并打开文件/文件夹"
            icon={<FolderSymlink />}
            handleFunction={async () => {
              // 打开文件或网页
              openBrowserOrFile();
            }}
          />
          <ToolbarItem
            description="AI扩展节点，（已欠费，有待更新）"
            icon={<BrainCircuit />}
            handleFunction={() => {
              StageGeneratorAI.generateNewTextNodeBySelected();
              StageHistoryManager.recordStep();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 框 */}
      {isHaveSelectedSection && (
        <ToolbarGroup groupTitle="框">
          <ToolbarItem
            description="切换Section的折叠状态（快捷键可自定义）（还在开发中，暂时不推荐使用）"
            icon={<Package />}
            handleFunction={() => {
              StageManager.sectionSwitchCollapse();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 鼠标模式 */}
      <ToolbarSelectGroup groupTitle="鼠标模式" currentSelectIndex={currentMouseModeIndex}>
        <ToolbarItem
          description="左键：框选/移动/创建节点 模式"
          icon={<MousePointer />}
          handleFunction={() => {
            selectSelectingMouse();
          }}
          color={nodeFillColor}
        />
        <ToolbarItem
          description="左键：涂鸦模式"
          icon={<Pencil />}
          handleFunction={() => {
            selectDrawingMouse();
          }}
          color={penStrokeColor}
        />
        <ToolbarItem
          description="左键：连接/斩断 模式"
          icon={<Waypoints />}
          handleFunction={() => {
            selectConnectingMouse();
          }}
        />
      </ToolbarSelectGroup>

      {/* 涂鸦笔触颜色 */}
      {isDrawing && (
        <ToolbarGroup groupTitle="涂鸦笔触颜色">
          <PenItem color={Color.Transparent} />
          <PenItem color={Color.Green} />
          <PenItem color={Color.Red} />
          <PenItem color={Color.Blue} />
          <PenItem color={Color.Yellow} />
          <PenItem color={Color.Cyan} />
          <PenItem color={Color.Magenta} />
        </ToolbarGroup>
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
