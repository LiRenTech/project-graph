import { open } from "@tauri-apps/plugin-shell";
import { useEffect, useState } from "react";
import { Color } from "../core/dataStruct/Color";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";
// https://lucide.dev/icons
import { invoke } from "@tauri-apps/api/core";
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
  BrainCircuit,
  ClipboardPaste,
  // ChevronsRightLeft,
  ClipboardX,
  Globe,
  LayoutDashboard,
  Package,
  PackageOpen,
  PaintBucket,
  Repeat,
  SaveAll,
  Square,
  Tag,
  Trash2,
} from "lucide-react";
import React from "react";
import Box from "../components/ui/Box";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ApiKeyManager } from "../core/ai/ApiKeyManager";
import { TextRiseEffect } from "../core/effect/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../core/effect/concrete/ViewFlashEffect";
import { Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { useDialog } from "../utils/dialog";
import { usePopupDialog } from "../utils/popupDialog";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
}

function ToolbarItem({ icon, handleFunction, description }: ToolbarItemProps) {
  return (
    <div
      className="group relative flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/20 active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="pointer-events-none absolute right-10 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded bg-gray-700 p-1 text-xs text-white opacity-0 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
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
function ColorPanel() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center">
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(239, 68, 68));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(234, 179, 8));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(22, 163, 74));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(59, 130, 246));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(168, 85, 247));
          }}
        />
        {/* 清除颜色 */}
        <div
          className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-gray-500 text-center text-sm hover:scale-125"
          onClick={() => {
            StageManager.clearNodeColor();
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
            StageManager.setNodeColor(new Color(r, g, b));
          }}
        ></input>
      </div>
    </>
  );
}

function GenerateNodePanel() {
  const [inputValue, setInputValue] = useState("");
  const [indention, setIndention] = useState(4);

  return (
    <>
      <Input value={inputValue} onChange={setInputValue} multiline />
      <div>
        <span>缩进</span>
        <Input value={indention.toString()} onChange={setIndention} number />
      </div>
      <Button
        onClick={() => {
          StageManager.generateNodeByText(inputValue, indention);
          setInputValue("");
        }}
      >
        生成
      </Button>
    </>
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
          Stage.effects.push(new TextRiseEffect("该功能还未实现"));
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
          Stage.effects.push(new TextRiseEffect("该功能还未实现"));
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
  const popupDialog = usePopupDialog();
  const dialog = useDialog();
  const [isCopyClearShow, setIsCopyClearShow] = useState(false);
  const [isHaveSelectedNode, setSsHaveSelectedNode] = useState(false);
  const [isHaveSelectedNodeOverTwo, setSsHaveSelectedNodeOverTwo] =
    useState(false);
  const [isHaveSelectedEdge, setSsHaveSelectedEdge] = useState(false);

  const update = () => {
    setSsHaveSelectedNode(StageManager.selectedNodeCount > 0);
    setSsHaveSelectedNodeOverTwo(StageManager.selectedNodeCount > 1);
    setSsHaveSelectedEdge(StageManager.selectedEdgeCount > 0);
    setIsCopyClearShow(Stage.copyBoardData.nodes.length > 0);
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
  return (
    <Box
      className={cn(
        "fixed right-16 top-1/2 z-50 flex w-10 -translate-y-1/2 flex-col items-center gap-4 rounded-full px-8 py-6 opacity-50 hover:opacity-100",
        className,
      )}
    >
      <ToolbarItem
        description="通过文本生成节点"
        icon={<ClipboardPaste />}
        handleFunction={() => popupDialog.show(<GenerateNodePanel />)}
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
            const selectedEdges = StageManager.getEdges().filter(
              (edge) => edge.isSelected,
            );
            StageManager.reverseEdges(selectedEdges);
          }}
        />
      )}

      {isHaveSelectedNode && (
        <ToolbarItem
          description="设置节点颜色"
          icon={<PaintBucket />}
          handleFunction={() => popupDialog.show(<ColorPanel />)}
        />
      )}

      {isHaveSelectedNodeOverTwo && (
        <ToolbarItem
          description="节点对齐相关"
          icon={<LayoutDashboard />}
          handleFunction={() => popupDialog.show(<AlignNodePanel />)}
        />
      )}
      {isCopyClearShow && (
        <ToolbarItem
          description="清空粘贴板内容"
          icon={<ClipboardX />}
          handleFunction={() => {
            StageManager.clearClipboard();
          }}
        />
      )}
      {isHaveSelectedNode && (
        <ToolbarItem
          description="将选中的节点的内容作为网页链接或本地文件路径打开"
          icon={<Globe />}
          handleFunction={() => {
            if (StageSaveManager.isSaved()) {
              openBrowserOrFile();
            } else {
              // Stage.effects.push(new TextRiseEffect("请先保存文件"));
              StageSaveManager.saveHandleWithoutCurrentPath(
                StageDumper.dump(),
                () => {
                  openBrowserOrFile();
                },
                (err) => {
                  Stage.effects.push(new TextRiseEffect("保存失败" + err));
                },
              );
            }
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
      {isHaveSelectedNodeOverTwo && (
        <ToolbarItem
          description="将选中节点打包Section（Section目前bug较多，还在开发中，暂时不推荐使用）"
          icon={<Square />}
          handleFunction={() => {
            onPackNodeToSection();
          }}
        />
      )}
      <ToolbarItem
        description="将选中的Section折叠起来"
        icon={<Package />}
        handleFunction={() => {
          StageManager.packSelectedSection();
        }}
      />
      <ToolbarItem
        description="将选中的Section展开"
        icon={<PackageOpen />}
        handleFunction={() => {
          StageManager.unpackSelectedSection();
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
            if (ApiKeyManager.getKeyArk().length === 0) {
              dialog.show({
                title: "提示",
                content: "当前为非官方构建，请使用官方构建方可使用AI功能。",
                type: "info",
              });
              return;
            }
            StageManager.expandTextNodeByAI();
          }}
        />
      )}
    </Box>
  );
}
function onPackNodeToSection() {
  const selectedNodes = StageManager.getTextNodes().filter(
    (node) => node.isSelected,
  );
  if (selectedNodes.length < 2) {
    return;
  }
  StageManager.packEntityToSection(selectedNodes);
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
    invoke<string>("save_file_by_path", {
      path,
      content: JSON.stringify(data, null, 2),
    })
      .then((_) => {
        Stage.effects.push(new ViewFlashEffect(Color.Black));
      })
      .catch((err) => {
        Stage.effects.push(new TextRiseEffect("保存失败" + err));
      });
  } catch (e) {
    Stage.effects.push(new TextRiseEffect("保存失败" + e));
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
      if (isValidURL(nodeText)) {
        // 是网址
        myOpen(nodeText);
      } else {
        const isExists = await invoke<string>("check_json_exist", {
          path: nodeText,
        });
        if (isExists) {
          // 是文件
          myOpen(nodeText);
        } else {
          // 不是网址也不是文件，不做处理
          Stage.effects.push(new TextRiseEffect("非法路径: " + nodeText));
        }
      }
    }
  }
}

function myOpen(url: string) {
  open(url)
    .then((_) => {})
    .catch((e) => {
      // 依然会导致程序崩溃，具体原因未知
      console.error(e);
    });
}

function isValidURL(url: string): boolean {
  const urlPattern =
    /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(:\d{1,5})?(\/[^\s]*)?$/i;
  return urlPattern.test(url);
}

function deleteSelectedObjects() {
  StageManager.deleteEntities(
    StageManager.getTextNodes().filter((node) => node.isSelected),
  );
  for (const edge of StageManager.getEdges()) {
    if (edge.isSelected) {
      StageManager.deleteEdge(edge);
    }
  }
}
