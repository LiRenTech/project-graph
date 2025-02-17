import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  Blend,
  BrainCircuit,
  ClipboardPaste,
  // ChevronsRightLeft,
  ClipboardX,
  Columns4,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Magnet,
  MousePointer,
  Network,
  Package,
  PaintBucket,
  PenTool,
  Pin,
  RefreshCcw,
  Repeat,
  SaveAll,
  Square,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import Button from "../components/Button";
import Input from "../components/Input";
import { Color } from "../core/dataStruct/Color";
import { StageExportSvg } from "../core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { TextRiseEffect } from "../core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/service/feedbackService/effectEngine/concrete/ViewFlashEffect";
import { Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";
// import { StageSaveManager } from "../core/stage/StageSaveManager";
import { Dialog } from "../components/dialog";
import { Popup } from "../components/popup";
import { writeTextFile } from "../utils/fs";
// import { PathString } from "../utils/pathString";
import IconButton from "../components/IconButton";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { ColorManager } from "../core/service/feedbackService/ColorManager";
import ColorManagerPanel from "./_color_manager_panel";
import { Settings } from "../core/service/Settings";
import { GraphMethods } from "../core/stage/stageManager/basicMethods/GraphMethods";
import { ConnectableEntity } from "../core/stage/stageObject/abstract/ConnectableEntity";
import { openBrowserOrFile } from "../utils/externalOpen";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
}

function ToolbarItem({ icon, handleFunction, description }: ToolbarItemProps) {
  return (
    <div
      className="hover:bg-toolbar-icon-hover-bg text-toolbar-tooltip-text group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="bg-toolbar-tooltip-bg border-toolbar-tooltip-border text-toolbar-tooltip-text pointer-events-none absolute right-10 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded border p-1 text-xs opacity-0 group-hover:scale-100 group-hover:opacity-100">
        {description}
      </span>
    </div>
  );
}

/**
 * 调色盘面板
 * @param param0
 * @returns
 */
export function ColorPanel() {
  const [currentColors, setCurrentColors] = useState<Color[]>([]);
  const [autoFillNodeColor, setAutoFillNodeColor] = useState<Color>(Color.Transparent);
  const [autoFillNodeColorEnable, setAutoFillNodeColorEnable] = useState(true);

  useEffect(() => {
    ColorManager.getUserEntityFillColors().then((colors) => {
      setCurrentColors(colors);
    });
    Settings.watch("autoFillNodeColor", (value) => {
      setAutoFillNodeColor(new Color(...value));
    });
    Settings.watch("autoFillNodeColorEnable", (value) => {
      setAutoFillNodeColorEnable(value);
    });
  }, []);

  const handleClickSwitchNodeFillColor = () => {
    Settings.set("autoFillNodeColorEnable", !autoFillNodeColorEnable);
  };

  return (
    <div className="bg-panel-bg rounded-lg">
      {/* 官方提供的默认颜色 */}
      <div className="flex flex-wrap items-center justify-center">
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 hover:scale-125"
          onClick={() => {
            const color = new Color(239, 68, 68);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 hover:scale-125"
          onClick={() => {
            const color = new Color(234, 179, 8);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 hover:scale-125"
          onClick={() => {
            const color = new Color(22, 163, 74);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 hover:scale-125"
          onClick={() => {
            const color = new Color(59, 130, 246);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 hover:scale-125"
          onClick={() => {
            const color = new Color(168, 85, 247);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        {/* 清除颜色 */}
        <div
          className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-transparent text-center text-sm hover:scale-125"
          onClick={() => {
            const color = Color.Transparent;
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        >
          <Blend className="h-5 w-5" />
        </div>
      </div>
      {/* 按钮 */}
      <div className="flex flex-wrap items-center justify-center">
        {/* 临时自定义 */}
        <input
          type="color"
          id="colorPicker"
          value="#ff0000"
          onChange={(e) => {
            const color = e.target.value;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            StageManager.setEntityColor(new Color(r, g, b));
            StageManager.setEdgeColor(new Color(r, g, b));
          }}
        ></input>
        <Button
          onClick={() => {
            Popup.show(<ColorManagerPanel />);
          }}
        >
          打开颜色管理
        </Button>
      </div>
      <hr className="text-panel-details-text my-2" />
      {/* 用户颜色库 */}
      <div className="flex max-w-64 flex-wrap items-center justify-center">
        {currentColors.map((color) => {
          return (
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full hover:scale-125"
              key={color.toString()}
              style={{
                backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
              }}
              onClick={() => {
                StageManager.setEntityColor(color);
                StageManager.setEdgeColor(color);
                Settings.set("autoFillNodeColor", color.toArray());
              }}
            />
          );
        })}
      </div>
      <hr className="text-panel-details-text my-2" />
      {/* 自动创建节点的颜色 */}
      <div className="flex justify-center">
        <span className="flex items-center justify-center text-sm">
          <span className={cn(!autoFillNodeColorEnable && "opacity-50")}>创建节点自动上色</span>
          <div
            className={cn("m-1 h-5 w-5 rounded-full border-2", !autoFillNodeColorEnable && "scale-50")}
            style={{
              backgroundColor: autoFillNodeColor.toString(),
            }}
          ></div>
          {autoFillNodeColorEnable ? (
            <ToggleRight className="cursor-pointer" onClick={handleClickSwitchNodeFillColor} />
          ) : (
            <ToggleLeft className="cursor-pointer" onClick={handleClickSwitchNodeFillColor} />
          )}
        </span>
      </div>
    </div>
  );
}

/**
 * 通过文本来生成节点的面板
 * @returns
 */
function GenerateNodePanel() {
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

function AlignNodePanel() {
  const [isEnableDragAutoAlign, setEnableDragAutoAlign] = useState(false);

  useEffect(() => {
    Settings.watch("enableDragAutoAlign", (value) => {
      setEnableDragAutoAlign(value);
    });
  }, []);

  return (
    <div className="bg-panel-bg">
      <div className="grid grid-cols-3 grid-rows-3">
        <div />
        <ToolbarItem
          description="顶对齐"
          icon={<AlignStartHorizontal />}
          handleFunction={() => {
            StageManager.alignTop();
          }}
        />
        <div />
        <ToolbarItem
          description="左对齐"
          icon={<AlignStartVertical />}
          handleFunction={() => {
            StageManager.alignLeft();
          }}
        />
        <div />
        <ToolbarItem
          description="右对齐"
          icon={<AlignEndVertical />}
          handleFunction={() => {
            StageManager.alignRight();
          }}
        />
        <div />
        <ToolbarItem
          description="底对齐"
          icon={<AlignEndHorizontal />}
          handleFunction={() => {
            StageManager.alignBottom();
          }}
        />
        <div />
      </div>

      <div className="grid grid-cols-3 grid-rows-2">
        <ToolbarItem
          description="相等间距垂直对齐"
          icon={<AlignVerticalSpaceBetween />}
          handleFunction={() => {
            StageManager.alignVerticalSpaceBetween();
          }}
        />
        <div />
        <ToolbarItem
          description="相等间距水平对齐"
          icon={<AlignHorizontalSpaceBetween />}
          handleFunction={() => {
            StageManager.alignHorizontalSpaceBetween();
          }}
        />
        <ToolbarItem
          description="中心垂直对齐"
          icon={<AlignCenterVertical />}
          handleFunction={() => {
            StageManager.alignCenterVertical();
          }}
        />
        <div />
        <ToolbarItem
          description="中心水平对齐"
          icon={<AlignCenterHorizontal />}
          handleFunction={() => {
            StageManager.alignCenterHorizontal();
          }}
        />
      </div>
      <div className="relative flex justify-center">
        {/* {isEnableDragAutoAlign && <Magnet className="absolute animate-ping" />} */}
        <ToolbarItem
          description={isEnableDragAutoAlign ? "拖动吸附对齐：开启" : "拖动吸附对齐：关闭"}
          icon={<Magnet className={cn(isEnableDragAutoAlign ? "animate-spin" : "scale-50", "transition-transform")} />}
          handleFunction={async () => {
            Settings.set("enableDragAutoAlign", !(await Settings.get("enableDragAutoAlign")));
          }}
        />
      </div>
      <div className="flex">
        <ToolbarItem
          description="自动布局（选中的唯一节点必须是树形结构的根节点）"
          icon={<Network />}
          handleFunction={() => {
            const selected = StageManager.getSelectedEntities();
            if (selected.length !== 1) {
              Dialog.show({
                title: "选择节点数量不正确",
                content: "必须只选择一个根节点才可以进行树形结构布局，且连接的节点必须符合树形结构",
              });
              return;
            }
            const selectedEntity = selected[0];
            if (selectedEntity instanceof ConnectableEntity) {
              if (GraphMethods.isTree(selectedEntity)) {
                StageManager.autoLayoutFastTreeMode();
              } else {
                Dialog.show({
                  title: "连接的节点必须符合树形结构",
                  content: "连接的节点必须符合树形结构，不能有环路，不能有重叠指向",
                });
              }
            } else {
              Dialog.show({
                title: "选择的对象必须是可连线的节点对象",
                content: "必须只选择一个根节点才可以进行树形结构布局，且连接的节点必须符合树形结构",
              });
            }
          }}
        />
        <ToolbarItem
          description="尽可能排列成正方形"
          icon={<LayoutGrid />}
          handleFunction={() => {
            StageManager.layoutToSquare();
          }}
        />
        <ToolbarItem
          description="排一串"
          icon={<Columns4 />}
          handleFunction={() => {
            StageManager.layoutToTightSquare();
          }}
        />
      </div>
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
  const [ignoreMouse, setIgnoreMouse] = useState(false);
  // 是否固定不缩小化
  const [isPinned, setIsPinned] = useState(true);

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

    const handleMouseDown = () => {
      setIgnoreMouse(true);
    };
    const handleMouseUp = () => {
      setIgnoreMouse(false);
    };

    document.querySelector("canvas")?.addEventListener("mousedown", handleMouseDown);
    document.querySelector("canvas")?.addEventListener("mouseup", handleMouseUp);
    return () => {
      clearInterval(intervalId);
      // window.removeEventListener("keydown", handleKeyDown);
      document.querySelector("canvas")?.removeEventListener("mousedown", handleMouseDown);
      document.querySelector("canvas")?.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // 一个竖向的工具栏，在页面顶部，右侧显示
  // z-index: 40; 不写成最大的50，
  // 因为报错窗口可能会被它遮挡住导致无法在右上角关闭报错窗口
  return (
    <div
      className={cn("group/wrapper rounded-4xl fixed right-0 top-1/2 z-40 -translate-y-1/2 px-8 pl-16", {
        "pointer-events-none": ignoreMouse,
      })}
    >
      <Box
        className={cn(
          {
            "scale-[10%]": !isPinned,
            "opacity-25": !isPinned,
            "bg-toolbar-collapsed-bg": !isPinned,
            "bg-toolbar-bg": isPinned,
            "border-toolbar-border": isPinned,
          },
          "group-hover/wrapper:border-toolbar-border border-toolbar-border group-hover/wrapper:bg-toolbar-bg relative flex w-10 origin-right flex-col items-center gap-1 rounded-full px-8 py-6 group-hover/wrapper:scale-100 group-hover/wrapper:border group-hover/wrapper:opacity-100",
          className,
        )}
      >
        <IconButton
          onClick={() => setIsPinned(!isPinned)}
          className="rounded-4xl absolute right-[-16px] top-[50%] translate-y-[-50%] hover:cursor-pointer"
        >
          <Pin className={cn("h-4 w-4 rotate-180 hover:cursor-pointer", { "rotate-45": isPinned })} />
          {/* {isPinned ? (
            <Pin className="h-4 w-4 hover:cursor-pointer" />
          ) : (
            <PinOff className="h-4 w-4 rotate-180 hover:cursor-pointer" />
          )} */}
        </IconButton>
        <ToolbarItem
          description="通过文本生成节点"
          icon={<ClipboardPaste />}
          handleFunction={() => Popup.show(<GenerateNodePanel />)}
        />
        {isHaveSelectedNode && (
          <ToolbarItem
            description="删除选中对象"
            icon={<Trash2 />}
            handleFunction={() => {
              deleteSelectedObjects();
            }}
          />
        )}
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
        {/* {isHaveSelectedNode && (
        <ToolbarItem
          description="计算文字"
          icon={<Calculator />}
          handleFunction={() => {
            StageManager.calculateSelectedNode();
          }}
        />
      )} */}
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
        {/* 测试占位符 */}
        {/* <ToolbarItem
          description="自动布局（选中的唯一节点必须是树形结构的根节点）"
          icon={<Network />}
          handleFunction={() => {
            StageManager.autoLayoutFastTreeMode();
          }}
        />
        <ToolbarItem
          description="自动布局（选中的唯一节点必须是树形结构的根节点）"
          icon={<Network />}
          handleFunction={() => {
            StageManager.autoLayoutFastTreeMode();
          }}
        />
        <ToolbarItem
          description="自动布局（选中的唯一节点必须是树形结构的根节点）"
          icon={<Network />}
          handleFunction={() => {
            StageManager.autoLayoutFastTreeMode();
          }}
        /> */}
      </Box>
    </div>
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

function deleteSelectedObjects() {
  StageManager.deleteEntities(StageManager.getTextNodes().filter((node) => node.isSelected));
  for (const edge of StageManager.getLineEdges()) {
    if (edge.isSelected) {
      StageManager.deleteEdge(edge);
    }
  }
}
