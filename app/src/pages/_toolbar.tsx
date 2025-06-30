import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";

import {
  BrainCircuit,
  ChevronsLeftRightEllipsis,
  ChevronsRightLeft,
  ClipboardPaste,
  FolderSymlink,
  GitBranchPlus,
  LayoutDashboard,
  Maximize2,
  Merge,
  Minimize2,
  MousePointer,
  MoveUpRight,
  Package,
  PaintBucket,
  Palette,
  Pencil,
  RefreshCcw,
  Repeat,
  SaveAll,
  Shrink,
  Slash,
  Spline,
  Square,
  SquareDashed,
  Tag,
  Trash2,
  Waypoints,
  WrapText,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "../components/Box";
import { Panel } from "../components/panel";
import { Popup } from "../components/popup";
import { Color } from "../core/dataStruct/Color";
import { Vector } from "../core/dataStruct/Vector";
import { TextRiseEffect } from "../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/service/feedbackService/effectEngine/concrete/ViewFlashEffect";
import { StageStyleManager } from "../core/service/feedbackService/stageStyle/StageStyleManager";
import { LeftMouseModeEnum, Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageHistoryManager } from "../core/stage/stageManager/StageHistoryManager";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { StageGeneratorAI } from "../core/stage/stageManager/concreteMethods/StageGeneratorAI";
import { ConnectableEntity } from "../core/stage/stageObject/abstract/ConnectableEntity";
import { MultiTargetUndirectedEdge } from "../core/stage/stageObject/association/MutiTargetUndirectedEdge";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { cn } from "../utils/cn";
import { openBrowserOrFile, openSelectedImageNode } from "../utils/externalOpen";
import { writeTextFile } from "../utils/fs";
import { isMac } from "../utils/platform";
import AlignNodePanel from "./_popup_panel/_align_panel";
import ColorAutoPanel from "./_popup_panel/_color_auto_panel";
import EdgeExtremePointPanel from "./_popup_panel/_edge_extreme_point_panel";
import GenerateNodePanel from "./_popup_panel/_generate_node_panel";
import ColorWindow from "./_sub_window/ColorWindow";

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
  const { t } = useTranslation("toolbar");

  // 是否显示清空粘贴板
  const [isHaveSelectedStageObject, setIsHaveSelectedStageObject] = useState(false);
  const [isHaveSelectedEntity, setIsHaveSelectedEntity] = useState(false);
  const [isHaveSelectedImageNode, setIsHaveSelectedImageNode] = useState(false);
  const [isHaveSelectedTextNode, setIsHaveSelectedTextNode] = useState(false);
  const [isHaveSelectedSection, setIsHaveSelectedSection] = useState(false);
  const [isHaveSelectedEdge, setIsHaveSelectedEdge] = useState(false);
  const [isHaveSelectedMultiTargetEdge, setIsHaveSelectedMultiTargetEdge] = useState(false);
  const [isHaveSelectedCREdge, setIsHaveSelectedCREdge] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penStrokeColor, setPenStrokeColor] = useState(Color.Transparent);
  const [nodeFillColor, setNodeFillColor] = useState(Color.Transparent);

  const update = () => {
    setIsHaveSelectedEntity(this.project.stageObjectSelectCounter.selectedEntityCount > 0);
    setIsHaveSelectedEdge(this.project.stageObjectSelectCounter.selectedEdgeCount > 0);
    setIsHaveSelectedCREdge(this.project.stageObjectSelectCounter.selectedCREdgeCount > 0);
    setIsHaveSelectedStageObject(this.project.stageObjectSelectCounter.selectedStageObjectCount > 0);
    setIsHaveSelectedImageNode(this.project.stageObjectSelectCounter.selectedImageNodeCount > 0);
    setIsHaveSelectedTextNode(this.project.stageObjectSelectCounter.selectedTextNodeCount > 0);
    setIsHaveSelectedSection(this.project.stageObjectSelectCounter.selectedSectionCount > 0);
    setIsHaveSelectedMultiTargetEdge(this.project.stageObjectSelectCounter.selectedMultiTargetUndirectedEdgeCount > 0);
  };

  const [currentMouseModeIndex, setCurrentMouseModeIndex] = useState(0);

  const selectSelectingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.selectAndMove;
    setIsDrawing(false);
    setCurrentMouseModeIndex(0);
  };
  const selectDrawingMouse = () => {
    Stage.leftMouseMode = LeftMouseModeEnum.draw;

    // 自动取消选择当前状态，避免按ALT调整画笔粗细时，和移动模式下的alt跳转相互干扰
    // StageManager.clearSelectAll();

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
      <ToolbarGroup groupTitle={t("pinnedTools.title")}>
        <ToolbarItem
          description={t("pinnedTools.items.generateTextNodeByText")}
          icon={<ClipboardPaste />}
          handleFunction={() => Popup.show(<GenerateNodePanel />, true)}
        />
        <ToolbarItem
          description={t("pinnedTools.items.autoFillColorSettings")}
          icon={<Palette />}
          handleFunction={() => Panel.show({ title: "颜色自动填充" }, <ColorAutoPanel />)}
        />
      </ToolbarGroup>

      {/* 舞台对象 */}
      {isHaveSelectedStageObject && (
        <ToolbarGroup groupTitle={t("stageObjects.title")}>
          <ToolbarItem
            description={t("stageObjects.items.setColor")}
            icon={<PaintBucket />}
            handleFunction={() => ColorWindow.open()}
          />
          <ToolbarItem
            description={t("stageObjects.items.delete")}
            icon={<Trash2 />}
            handleFunction={() => {
              StageManager.deleteSelectedStageObjects();
            }}
          />
          <ToolbarItem
            description={t("stageObjects.items.tag")}
            icon={<Tag />}
            handleFunction={() => {
              StageManager.addTagBySelected();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 多源无向边 */}
      {isHaveSelectedMultiTargetEdge && (
        <ToolbarGroup groupTitle={t("multiTargetUndirectedEdges.title")}>
          <ToolbarItem
            description={t("multiTargetUndirectedEdges.items.switchToEdge")}
            icon={<MoveUpRight />}
            handleFunction={() => {
              StageManager.switchUndirectedEdgeToEdge();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("multiTargetUndirectedEdges.items.arrowExterior")}
            icon={<Maximize2 />}
            handleFunction={() => {
              const selectedMTUEdge = StageManager.getSelectedAssociations().filter(
                (edge) => edge instanceof MultiTargetUndirectedEdge,
              );
              for (const multi_target_undirected_edge of selectedMTUEdge) {
                multi_target_undirected_edge.arrow = "outer";
              }
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("multiTargetUndirectedEdges.items.arrowInterior")}
            icon={<Minimize2 />}
            handleFunction={() => {
              const selectedMTUEdge = StageManager.getSelectedAssociations().filter(
                (edge) => edge instanceof MultiTargetUndirectedEdge,
              );
              for (const multi_target_undirected_edge of selectedMTUEdge) {
                multi_target_undirected_edge.arrow = "inner";
              }
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("multiTargetUndirectedEdges.items.noArrow")}
            icon={<Slash />}
            handleFunction={() => {
              const selectedMTUEdge = StageManager.getSelectedAssociations().filter(
                (edge) => edge instanceof MultiTargetUndirectedEdge,
              );
              for (const multi_target_undirected_edge of selectedMTUEdge) {
                multi_target_undirected_edge.arrow = "none";
              }
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("multiTargetUndirectedEdges.items.switchRenderState")}
            icon={<RefreshCcw />}
            handleFunction={() => {
              const selectedMTUEdge = StageManager.getSelectedAssociations().filter(
                (edge) => edge instanceof MultiTargetUndirectedEdge,
              );
              for (const multi_target_undirected_edge of selectedMTUEdge) {
                if (multi_target_undirected_edge.renderType === "line") {
                  multi_target_undirected_edge.renderType = "convex";
                } else if (multi_target_undirected_edge.renderType === "convex") {
                  multi_target_undirected_edge.renderType = "line";
                }
              }
              StageHistoryManager.recordStep();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 连线对象 */}
      {isHaveSelectedEdge && (
        <ToolbarGroup groupTitle={t("edge.title")}>
          <ToolbarItem
            description={t("edge.items.switchDirection")}
            icon={<Repeat />}
            handleFunction={() => {
              const selectedEdges = StageManager.getLineEdges().filter((edge) => edge.isSelected);
              this.project.nodeConnector.reverseEdges(selectedEdges);
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("edge.items.switchToCrEdge") + "还在开发中，不推荐使用"}
            icon={<Spline />}
            handleFunction={() => {
              StageManager.switchLineEdgeToCrEdge();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("edge.items.switchToUndirectedEdge")}
            icon={<ChevronsLeftRightEllipsis />}
            handleFunction={() => {
              StageManager.switchEdgeToUndirectedEdge();
              StageHistoryManager.recordStep();
            }}
          />

          <ToolbarItem
            description={t("edge.items.setExtremePoint")}
            icon={<Shrink className="rotate-45" />}
            handleFunction={() => Popup.show(<EdgeExtremePointPanel />, true)}
          />
        </ToolbarGroup>
      )}

      {/* CR曲线 */}
      {isHaveSelectedCREdge && (
        <ToolbarGroup groupTitle={t("crEdge.title")}>
          <ToolbarItem
            description={t("crEdge.items.addControlPoint")}
            icon={<GitBranchPlus />}
            handleFunction={() => {
              StageManager.addSelectedCREdgeControlPoint();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("crEdge.items.tensionIncrease")}
            icon={<ChevronsRightLeft />}
            handleFunction={() => {
              StageManager.addSelectedCREdgeTension();
              StageHistoryManager.recordStep();
            }}
          />
          <ToolbarItem
            description={t("crEdge.items.tensionDecrease")}
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
        <ToolbarGroup groupTitle={t("entity.title")}>
          <ToolbarItem
            description={t("entity.items.align")}
            icon={<LayoutDashboard />}
            handleFunction={() => Popup.show(<AlignNodePanel />, true)}
          />
          <ToolbarItem
            description={t("entity.items.saveNew")}
            icon={<SaveAll />}
            handleFunction={() => {
              onSaveSelectedNew();
            }}
          />
          <ToolbarItem
            description={t("entity.items.packSection")}
            icon={<Square />}
            handleFunction={() => {
              StageManager.packEntityToSectionBySelected();
            }}
          />

          <ToolbarItem
            description={t("entity.items.createMultiTargetEdgeConvex")}
            icon={<SquareDashed />}
            handleFunction={async () => {
              const selectedNodes = StageManager.getSelectedEntities().filter(
                (node) => node instanceof ConnectableEntity,
              );
              if (selectedNodes.length <= 1) {
                this.project.effects.addEffect(new TextRiseEffect("至少选择两个可连接节点"));
                return;
              }
              const multiTargetUndirectedEdge = MultiTargetUndirectedEdge.createFromSomeEntity(selectedNodes);
              multiTargetUndirectedEdge.text = "group";
              multiTargetUndirectedEdge.renderType = "convex";
              StageManager.addAssociation(multiTargetUndirectedEdge);
            }}
          />
          <ToolbarItem
            description={t("entity.items.createMultiTargetEdgeLine")}
            icon={<Merge />}
            handleFunction={async () => {
              const selectedNodes = StageManager.getSelectedEntities().filter(
                (node) => node instanceof ConnectableEntity,
              );
              if (selectedNodes.length <= 1) {
                this.project.effects.addEffect(new TextRiseEffect("至少选择两个可连接节点"));
                return;
              }
              const multiTargetUndirectedEdge = MultiTargetUndirectedEdge.createFromSomeEntity(selectedNodes);
              StageManager.addAssociation(multiTargetUndirectedEdge);
            }}
          />
          <ToolbarItem
            description={t("entity.items.openPathByContent")}
            icon={<FolderSymlink />}
            handleFunction={async () => {
              // 打开文件或网页
              openBrowserOrFile();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 图片节点 */}
      {isHaveSelectedImageNode && (
        <ToolbarGroup groupTitle={t("imageNode.title")}>
          <ToolbarItem
            description={t("imageNode.items.refresh")}
            icon={<RefreshCcw />}
            handleFunction={() => {
              StageManager.refreshSelected();
            }}
          />
          <ToolbarItem
            description={t("imageNode.items.openImage")}
            icon={<FolderSymlink />}
            handleFunction={() => {
              openSelectedImageNode();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 文本节点 */}
      {isHaveSelectedTextNode && (
        <ToolbarGroup groupTitle={t("textNode.title")}>
          <ToolbarItem
            description={t("textNode.items.switchWidthAdjustMode")}
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
            description={t("textNode.items.aiGenerateNewNode") + "（已欠费，有待更新）"}
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
        <ToolbarGroup groupTitle={t("section.title")}>
          <ToolbarItem
            description={t("section.items.checkoutFolderState") + "（还在开发中，暂时不推荐使用）"}
            icon={<Package />}
            handleFunction={() => {
              StageManager.sectionSwitchCollapse();
            }}
          />
        </ToolbarGroup>
      )}

      {/* 鼠标模式 */}
      <ToolbarSelectGroup groupTitle={t("mouseMode.title")} currentSelectIndex={currentMouseModeIndex}>
        <ToolbarItem
          description={t("mouseMode.items.leftMouseSelectMove")}
          icon={<MousePointer />}
          handleFunction={() => {
            selectSelectingMouse();
          }}
          color={nodeFillColor}
        />
        <ToolbarItem
          description={t("mouseMode.items.leftMouseDraw")}
          icon={<Pencil />}
          handleFunction={() => {
            selectDrawingMouse();
          }}
          color={penStrokeColor}
        />
        <ToolbarItem
          description={t("mouseMode.items.leftMouseCutAndConnect")}
          icon={<Waypoints />}
          handleFunction={() => {
            selectConnectingMouse();
          }}
        />
      </ToolbarSelectGroup>

      {/* 涂鸦笔触颜色 */}
      {isDrawing && (
        <ToolbarGroup groupTitle={t("drawColor.title")}>
          <PenItem color={Color.Transparent} />
          <PenItem color={new Color(239, 83, 80)} />
          <PenItem color={new Color(78, 201, 176)} />
          <PenItem color={new Color(94, 153, 85)} />
          <PenItem color={new Color(86, 156, 214)} />
          <PenItem color={new Color(255, 215, 0)} />
          <PenItem color={new Color(218, 112, 214)} />
          <PenItem color={new Color(156, 220, 254)} />
          <PenItem color={new Color(206, 145, 120)} />
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
        this.project.effects.addEffect(new ViewFlashEffect(Color.Black));
      })
      .catch((err) => {
        this.project.effects.addEffect(new TextRiseEffect("保存失败" + err));
      });
  } catch (e) {
    this.project.effects.addEffect(new TextRiseEffect("保存失败" + e));
  }
};
