import { useState } from "react";
import { Color } from "../core/dataStruct/Color";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { cn } from "../utils/cn";
// https://lucide.dev/icons
import {
  Trash2,
  // ChevronsRightLeft,
  ClipboardX,
  ClipboardPaste,
  Repeat,
  PaintBucket,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
} from "lucide-react";
import React from "react";
import Box from "../components/ui/Box";
import { usePopupDialog } from "../utils/popupDialog";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

interface ToolbarItemProps {
  icon: React.ReactNode; // 定义 icon 的类型
  handleFunction: () => void; // 定义 handleFunction 的类型
  description: string;
}

function ToolbarItem({ icon, handleFunction, description }: ToolbarItemProps) {
  return (
    <div
      className="group relative flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-white/20 active:scale-90"
      onClick={handleFunction}
    >
      {icon}
      <span className="pointer-events-none absolute right-10 z-10 w-auto origin-right scale-90 whitespace-nowrap rounded bg-gray-700 p-1 text-xs text-white opacity-0 transition group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
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
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 transition-all hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(239, 68, 68));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 transition-all hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(234, 179, 8));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 transition-all hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(22, 163, 74));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 transition-all hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(59, 130, 246));
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 transition-all hover:scale-125"
          onClick={() => {
            StageManager.setNodeColor(new Color(168, 85, 247));
          }}
        />
        {/* 清除颜色 */}
        <div
          className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-gray-500 text-center text-sm transition-all hover:scale-125"
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
  const [value, setValue] = useState("");
  const [indention, setIndention] = useState(4);

  return (
    <>
      <Input value={value} onChange={setValue} multiline />
      <div>
        <span>缩进</span>
        <Input value={indention.toString()} onChange={setIndention} number />
      </div>
      <Button
        onClick={() => {
          StageManager.generateNodeByText(value, indention);
          setValue("");
        }}
      >
        生成
      </Button>
    </>
  );
}

/**
 * 工具栏
 * @param param0
 * @returns
 */
export default function Toolbar({ className = "" }) {
  const popupDialog = usePopupDialog();

  // 一个竖向的工具栏，在页面顶部，右侧显示
  return (
    <Box
      className={cn(
        "fixed right-16 top-1/2 z-50 flex w-10 -translate-y-1/2 flex-col items-center gap-4 rounded-full px-8 py-6 opacity-50 transition duration-200 hover:opacity-100",
        className,
      )}
    >
      <ToolbarItem
        description="删除选中对象"
        icon={<Trash2 />}
        handleFunction={() => {
          deleteSelectedObjects();
        }}
      />
      {/* <ToolbarItem
        description="折叠节点"
        icon={<ChevronsRightLeft />}
        handleFunction={() => {
          // 弹窗提示还未实现

        }}
      /> */}
      <ToolbarItem
        description="反转选中连线方向"
        icon={<Repeat />}
        handleFunction={() => {
          const selectedEdges = StageManager.edges.filter(
            (edge) => edge.isSelected,
          );
          StageManager.reverseEdges(selectedEdges);
        }}
      />

      {/* 颜色面板 */}
      <ToolbarItem
        description="设置节点颜色"
        icon={<PaintBucket />}
        handleFunction={() => popupDialog.show(<ColorPanel />)}
      />
      <ToolbarItem
        description="通过文本生成节点"
        icon={<ClipboardPaste />}
        handleFunction={() => popupDialog.show(<GenerateNodePanel />)}
      />
      <ToolbarItem
        description="左对齐"
        icon={<AlignStartVertical />}
        handleFunction={() => {
          StageManager.alignLeft();
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
        description="中心水平对齐"
        icon={<AlignCenterHorizontal />}
        handleFunction={() => {
          StageManager.alignCenterHorizontal();
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
      <ToolbarItem
        description="清空粘贴板内容"
        icon={<ClipboardX />}
        handleFunction={() => {
          StageManager.clearClipboard();
        }}
      />
    </Box>
  );
}

function deleteSelectedObjects() {
  StageManager.deleteNodes(
    StageManager.nodes.filter((node) => node.isSelected),
  );
  for (const edge of StageManager.edges) {
    if (edge.isSelected) {
      StageManager.deleteEdge(edge);
    }
  }
}
