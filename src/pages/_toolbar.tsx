import { useState } from "react";
import { Color } from "../core/dataStruct/Color";
import { NodeManager } from "../core/NodeManager";
import { cn } from "../utils/cn";
// https://lucide.dev/icons
import {
  Trash2,
  ChevronsRightLeft,
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
      <span className="absolute right-10 z-10 w-auto origin-right scale-0 whitespace-nowrap rounded bg-gray-700 p-1 text-xs text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
        {description}
      </span>
    </div>
  );
}

export default function Toolbar({ className = "" }) {
  const [isColorPanelOpen, setColorPanelOpen] = useState(false); // 控制颜色面板的状态

  const toggleColorPanel = () => {
    setColorPanelOpen(!isColorPanelOpen); // 切换面板的显示状态
  };

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
      <ToolbarItem
        description="折叠节点"
        icon={<ChevronsRightLeft />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="反转选中连线方向"
        icon={<Repeat />}
        handleFunction={() => {}}
      />

      {/* 颜色面板 */}
      {isColorPanelOpen && (
        <div className="absolute right-0 flex h-32 w-32 flex-col items-center justify-center rounded-lg bg-black">
          <div className="flex flex-wrap items-center justify-center">
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 transition-all hover:scale-125"
              onClick={() => {
                NodeManager.setNodeColor(new Color(239, 68, 68));
              }}
            />
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 transition-all hover:scale-125"
              onClick={() => {
                NodeManager.setNodeColor(new Color(234, 179, 8));
              }}
            />
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 transition-all hover:scale-125"
              onClick={() => {
                NodeManager.setNodeColor(new Color(22, 163, 74));
              }}
            />
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 transition-all hover:scale-125"
              onClick={() => {
                NodeManager.setNodeColor(new Color(59, 130, 246));
              }}
            />
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 transition-all hover:scale-125"
              onClick={() => {
                NodeManager.setNodeColor(new Color(239, 68, 68));
              }}
            />
            <div
              className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-gray-500 text-center text-sm transition-all hover:scale-125"
              onClick={() => {
                NodeManager.clearNodeColor();
              }}
            >
              <span>x</span>
            </div>
          </div>

          <button
            className="absolute right-0 top-0 rounded-lg bg-red-700 px-2"
            onClick={toggleColorPanel}
          >
            X
          </button>
        </div>
      )}
      <ToolbarItem
        description="设置节点颜色"
        icon={<PaintBucket />}
        handleFunction={toggleColorPanel}
      />
      <ToolbarItem
        description="左对齐"
        icon={<AlignStartVertical />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="右对齐"
        icon={<AlignEndVertical />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="中心水平对齐"
        icon={<AlignCenterHorizontal />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="中心垂直对齐"
        icon={<AlignCenterVertical />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="相等间距水平对齐"
        icon={<AlignHorizontalSpaceBetween />}
        handleFunction={() => {}}
      />
      <ToolbarItem
        description="相等间距垂直对齐"
        icon={<AlignVerticalSpaceBetween />}
        handleFunction={() => {}}
      />
    </Box>
  );
}

function deleteSelectedObjects() {
  NodeManager.deleteNodes(NodeManager.nodes.filter((node) => node.isSelected));
  for (const edge of NodeManager.edges) {
    if (edge.isSelected) {
      NodeManager.deleteEdge(edge);
    }
  }
}
