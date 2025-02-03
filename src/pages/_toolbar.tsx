import { save as saveFileDialog } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-shell";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  BrainCircuit,
  ClipboardPaste,
  // ChevronsRightLeft,
  ClipboardX,
  Globe,
  LayoutDashboard,
  Network,
  Package,
  PaintBucket,
  RefreshCcw,
  Repeat,
  SaveAll,
  Square,
  Tag,
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
import { PROJECT_GRAPH_FILE_EXT, writeTextFile } from "../utils/fs/com";
// import { PathString } from "../utils/pathString";
import { CopyEngine } from "../core/service/dataManageService/copyEngine/copyEngine";
import { ColorManager } from "../core/service/feedbackService/ColorManager";
import ColorManagerPanel from "./_color_manager_panel";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
}

function ToolbarItem({ icon, handleFunction, description }: ToolbarItemProps) {
  return (
    <div
      className="group hover:bg-toolbar-icon-hover-bg text-toolbar-tooltip-text relative flex h-8 w-8 items-center justify-center rounded-md active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="bg-toolbar-tooltip-bg border-toolbar-tooltip-border text-toolbar-tooltip-text pointer-events-none absolute right-10 z-10 w-auto origin-right scale-90 rounded border p-1 text-xs whitespace-nowrap opacity-0 group-hover:scale-100 group-hover:opacity-100">
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
  useEffect(() => {
    ColorManager.getUserEntityFillColors().then((colors) => {
      setCurrentColors(colors);
    });
  }, []);
  return (
    <>
      <div className="flex flex-wrap items-center justify-center">
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 hover:scale-125"
          onClick={() => {
            StageManager.setEntityColor(new Color(239, 68, 68));
            StageManager.setEdgeColor(new Color(239, 68, 68));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 hover:scale-125"
          onClick={() => {
            StageManager.setEntityColor(new Color(234, 179, 8));
            StageManager.setEdgeColor(new Color(234, 179, 8));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 hover:scale-125"
          onClick={() => {
            StageManager.setEntityColor(new Color(22, 163, 74));
            StageManager.setEdgeColor(new Color(22, 163, 74));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 hover:scale-125"
          onClick={() => {
            StageManager.setEntityColor(new Color(59, 130, 246));
            StageManager.setEdgeColor(new Color(59, 130, 246));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 hover:scale-125"
          onClick={() => {
            StageManager.setEntityColor(new Color(168, 85, 247));
            StageManager.setEdgeColor(new Color(168, 85, 247));
          }}
        />
        {/* 清除颜色 */}
        <div
          className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-gray-500 text-center text-sm hover:scale-125"
          onClick={() => {
            StageManager.clearNodeColor();
            StageManager.clearEdgeColor();
          }}
        >
          <span>x</span>
        </div>
        {/* 自定义 */}
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
      <div className="flex flex-wrap items-center justify-center">
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
              }}
            />
          );
        })}
      </div>
    </>
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
    <div className="flex flex-col gap-4">
      <Input value={inputValue} onChange={setInputValue} multiline />
      <div>
        <span>缩进</span>
        <Input value={indention.toString()} onChange={setIndention} number />
        <p className="text-xs text-neutral-400">会按照您的缩进等级来生成对应的节点结构</p>
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
  return (
    <div className="grid grid-cols-3 grid-rows-3">
      <ToolbarItem
        description="左对齐"
        icon={<AlignStartVertical />}
        handleFunction={() => {
          StageManager.alignLeft();
        }}
      />
      <ToolbarItem
        description="中心垂直对齐"
        icon={<AlignCenterVertical />}
        handleFunction={() => {
          StageManager.alignCenterVertical();
        }}
      />
      <ToolbarItem
        description="右对齐"
        icon={<AlignEndVertical />}
        handleFunction={() => {
          StageManager.alignRight();
        }}
      />
      <ToolbarItem
        description="顶对齐"
        icon={<AlignStartHorizontal />}
        handleFunction={() => {
          StageManager.alignTop();
        }}
      />
      <ToolbarItem
        description="中心水平对齐"
        icon={<AlignCenterHorizontal />}
        handleFunction={() => {
          StageManager.alignCenterHorizontal();
        }}
      />
      <ToolbarItem
        description="底对齐"
        icon={<AlignEndHorizontal />}
        handleFunction={() => {
          StageManager.alignBottom();
        }}
      />
      <ToolbarItem
        description="相等间距水平对齐"
        icon={<AlignHorizontalSpaceBetween />}
        handleFunction={() => {
          StageManager.alignHorizontalSpaceBetween();
        }}
      />
      <ToolbarItem
        description="相等间距垂直对齐"
        icon={<AlignVerticalSpaceBetween />}
        handleFunction={() => {
          StageManager.alignVerticalSpaceBetween();
        }}
      />
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
  const [isHaveSelectedNodeOverTwo, setSsHaveSelectedNodeOverTwo] = useState(false);
  const [isHaveSelectedEdge, setSsHaveSelectedEdge] = useState(false);
  const [ignoreMouse, setIgnoreMouse] = useState(false);

  const update = () => {
    setSsHaveSelectedNode(StageManager.selectedNodeCount > 0);
    setSsHaveSelectedNodeOverTwo(StageManager.selectedNodeCount > 1);
    setSsHaveSelectedEdge(StageManager.selectedEdgeCount > 0);
    setIsCopyClearShow(!CopyEngine.isClipboardEmpty());
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
      className={cn("group/wrapper fixed top-1/2 right-0 z-40 -translate-y-1/2 rounded-4xl px-8 pl-16", {
        "pointer-events-none": ignoreMouse,
      })}
    >
      <Box
        className={cn(
          "bg-toolbar-collapsed-bg group-hover/wrapper:border-toolbar-border group-hover/wrapper:bg-toolbar-bg flex w-10 origin-right scale-[10%] flex-col items-center gap-1 rounded-full px-8 py-6 opacity-25 group-hover/wrapper:scale-100 group-hover/wrapper:border group-hover/wrapper:opacity-100",
          className,
        )}
      >
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

        {(isHaveSelectedNode || isHaveSelectedEdge) && (
          <ToolbarItem
            description="设置节点/连线颜色"
            icon={<PaintBucket />}
            handleFunction={() => Popup.show(<ColorPanel />)}
          />
        )}

        {isHaveSelectedNodeOverTwo && (
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
              CopyEngine.clearCopyBoardData();
            }}
          />
        )}
        {isHaveSelectedNode && (
          <ToolbarItem
            description="将选中的节点的内容作为网页链接或本地文件路径打开"
            icon={<Globe />}
            handleFunction={async () => {
              // 先保存一下
              // if (!StageSaveManager.isSaved()) {
              //   await StageSaveManager.saveHandleWithoutCurrentPath(
              //     StageDumper.dump(),
              //   );
              // }
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
          description="自动布局（选中的唯一节点必须是树形结构的根节点）"
          icon={<Network />}
          handleFunction={() => {
            StageManager.autoLayoutFastTreeMode();
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
    defaultPath: `新文件.${PROJECT_GRAPH_FILE_EXT}`, // 提供一个默认的文件名
    filters: [
      {
        name: "Project Graph",
        extensions: [PROJECT_GRAPH_FILE_EXT],
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

async function openBrowserOrFile() {
  for (const node of StageManager.getTextNodes()) {
    if (node.isSelected) {
      let nodeText = node.text;
      if (node.text.startsWith('"') && node.text.endsWith('"')) {
        // 去除前后的引号
        nodeText = nodeText.slice(1, -1);
      }
      myOpen(nodeText);
      // 2025年1月4日——有自动备份功能了，好像不需要再加验证了

      // if (PathString.isValidURL(nodeText)) {
      //   // 是网址
      //   myOpen(nodeText);
      // } else {
      //   const isExists = await exists(nodeText);
      //   if (isExists) {
      //     // 是文件
      //     myOpen(nodeText);
      //   } else {
      //     // 不是网址也不是文件，不做处理
      //     Stage.effectMachine.addEffect(new TextRiseEffect("非法文件路径: " + nodeText));
      //   }
      // }
    }
  }
}

function myOpen(url: string) {
  open(url)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((_) => {})
    .catch((e) => {
      // 依然会导致程序崩溃，具体原因未知
      console.error(e);
    });
}

function deleteSelectedObjects() {
  StageManager.deleteEntities(StageManager.getTextNodes().filter((node) => node.isSelected));
  for (const edge of StageManager.getLineEdges()) {
    if (edge.isSelected) {
      StageManager.deleteEdge(edge);
    }
  }
}
