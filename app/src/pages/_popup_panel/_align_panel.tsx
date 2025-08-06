import { AutoLayoutFastTree } from "@/core/service/controlService/autoLayoutEngine/autoLayoutFastTreeMode";
import { Settings } from "@/core/service/Settings";
import { LayoutEntityManager } from "@/core/stage/stageManager/concreteMethods/layoutManager/layoutEntityManager";
import { LayoutManualAlign } from "@/core/stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import { LayoutResizeManager } from "@/core/stage/stageManager/concreteMethods/layoutManager/layoutResizeManager";
import { LayoutToSquareManager } from "@/core/stage/stageManager/concreteMethods/layoutManager/layoutToSquareManager";
import { LayoutToTightSquareManager } from "@/core/stage/stageManager/concreteMethods/layoutManager/layoutToTightSquareManager";
import { AutoAlign } from "@/core/stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageManager } from "@/core/stage/stageManager/StageManager";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { ToolbarItem } from "@/pages/_toolbar";
import { cn } from "@/utils/cn";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceBetween,
  ArrowDownUp,
  ArrowLeftRight,
  ChevronsRightLeft,
  Grid3x3,
  Grip,
  LayoutDashboard,
  Magnet,
  Maximize2,
  MoveHorizontal,
  Network,
  Square,
  SquareSquare,
} from "lucide-react";
import { toast } from "sonner";

/**
 * 对齐面板
 * @returns
 */
export default function AlignNodePanel() {
  const [isEnableDragAutoAlign] = Settings.use("enableDragAutoAlign");
  const [isEnableDragToGridAutoAlign] = Settings.use("enableDragAlignToGrid");

  const cell9ClassName = "border-1 bg-panel-bg grid grid-cols-3 grid-rows-3 rounded p-1 m-1";

  const isSelectedIsTreeRoot = (handleTreeRootFunc: (root: ConnectableEntity) => void) => {
    return () => {
      const selected = StageManager.getSelectedEntities();
      if (selected.length !== 1) {
        toast.error("必须只选择一个根节点才可以进行树形结构布局，且连接的节点必须符合树形结构");
        return;
      }
      const selectedEntity = selected[0];
      if (selectedEntity instanceof ConnectableEntity) {
        if (this.project.graphMethods.isTree(selectedEntity)) {
          handleTreeRootFunc(selectedEntity);
        } else {
          toast.error("连接的节点必须符合树形结构，不能有环路，不能有重叠指向");
        }
      } else {
        toast.error("必须只选择一个根节点才可以进行树形结构布局，且连接的节点必须符合树形结构");
      }
    };
  };

  return (
    <div className="grid grid-cols-3 grid-rows-2">
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description="顶对齐 (88)"
          icon={<AlignStartHorizontal />}
          handleFunction={() => {
            LayoutManualAlign.alignTop();
          }}
        />
        <div />
        <ToolbarItem
          description="左对齐 (44)"
          icon={<AlignStartVertical />}
          handleFunction={() => {
            LayoutManualAlign.alignLeft();
          }}
        />
        <div />
        <ToolbarItem
          description="右对齐 (66)"
          icon={<AlignEndVertical />}
          handleFunction={() => {
            LayoutManualAlign.alignRight();
          }}
        />
        <div />
        <ToolbarItem
          description="底对齐 (22)"
          icon={<AlignEndHorizontal />}
          handleFunction={() => {
            LayoutManualAlign.alignBottom();
          }}
        />
        <div />
      </div>

      <div className={cell9ClassName}>
        <ToolbarItem
          description="相等间距垂直对齐 (8282)"
          icon={<AlignVerticalSpaceBetween />}
          handleFunction={() => {
            LayoutManualAlign.alignVerticalSpaceBetween();
          }}
        />
        <div />
        <ToolbarItem
          description="相等间距水平对齐 (4646)"
          icon={<AlignHorizontalSpaceBetween />}
          handleFunction={() => {
            LayoutManualAlign.alignHorizontalSpaceBetween();
          }}
        />
        <ToolbarItem
          description="中心垂直对齐 (582)"
          icon={<AlignCenterVertical />}
          handleFunction={() => {
            LayoutManualAlign.alignCenterVertical();
          }}
        />
        <div />
        <ToolbarItem
          description="中心水平对齐 (546)"
          icon={<AlignCenterHorizontal />}
          handleFunction={() => {
            LayoutManualAlign.alignCenterHorizontal();
          }}
        />
        <ToolbarItem
          description="向下紧密堆积 (852)"
          icon={<AlignVerticalJustifyStart />}
          handleFunction={() => {
            LayoutManualAlign.alignTopToBottomNoSpace();
          }}
        />
        <div />
        <ToolbarItem
          description="向右紧密堆积 (456)"
          icon={<AlignHorizontalJustifyStart />}
          handleFunction={() => {
            LayoutManualAlign.alignLeftToRightNoSpace();
          }}
        />
      </div>
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description="上下反转树位置"
          icon={<ArrowDownUp />}
          handleFunction={isSelectedIsTreeRoot(AutoLayoutFastTree.treeReverseY)}
        />
        <div />
        <ToolbarItem
          description="左右反转树位置"
          icon={<ArrowLeftRight />}
          handleFunction={isSelectedIsTreeRoot(AutoLayoutFastTree.treeReverseX)}
        />
        <div />
        <ToolbarItem
          description="向右自动树形布局"
          icon={<Network className="-rotate-90" />}
          handleFunction={isSelectedIsTreeRoot(AutoAlign.autoLayoutSelectedFastTreeModeRight)}
        />
        <div />
        <ToolbarItem
          description="向下自动树形布局（点击一次布局一层）"
          icon={<Network />}
          handleFunction={isSelectedIsTreeRoot(AutoAlign.autoLayoutSelectedFastTreeModeDown)}
        />
        <div />
      </div>
      <div className={cell9ClassName}>
        <ToolbarItem
          description="松散方阵"
          icon={<Grip />}
          handleFunction={() => {
            LayoutEntityManager.layoutBySelected(LayoutToSquareManager.layoutToSquare, false);
          }}
        />
        <ToolbarItem
          description="紧密堆积"
          icon={<LayoutDashboard />}
          handleFunction={() => {
            LayoutEntityManager.layoutBySelected(LayoutToTightSquareManager.layoutToTightSquare, false);
          }}
        />
        <ToolbarItem
          description="树变框"
          icon={
            <span className="relative flex h-8 w-8 items-center justify-center">
              <Square className="absolute" />
              <Network className="absolute -rotate-90 scale-50" />
            </span>
          }
          handleFunction={() => {
            const selectedNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
            if (selectedNodes.length !== 1) {
              toast.error("必须只选择一个根节点才可以进行树形结构变成框嵌套结构");
              return;
            }
            this.project.sectionPackManager.textNodeTreeToSectionNoDeep(selectedNodes[0]);
          }}
        />
        <ToolbarItem
          description="松散方阵（递归）"
          icon={
            <span className="relative flex h-8 w-8 items-center justify-center">
              <Square className="absolute" />
              <Grip className="absolute scale-50" />
            </span>
          }
          handleFunction={() => {
            LayoutEntityManager.layoutBySelected(LayoutToSquareManager.layoutToSquare, true);
          }}
        />
        <ToolbarItem
          description="紧密堆积（递归）"
          icon={
            <span className="relative flex h-8 w-8 items-center justify-center">
              <Square className="absolute" />
              <LayoutDashboard className="absolute scale-50" />
            </span>
          }
          handleFunction={() => {
            LayoutEntityManager.layoutBySelected(LayoutToTightSquareManager.layoutToTightSquare, true);
          }}
        />
        <ToolbarItem
          description="树变框（递归）"
          icon={
            <span className="relative flex h-8 w-8 items-center justify-center">
              <Square className="absolute" />
              <SquareSquare className="absolute scale-50" />
            </span>
          }
          handleFunction={() => {
            const selectedNodes = StageManager.getSelectedEntities().filter((node) => node instanceof TextNode);
            if (selectedNodes.length !== 1) {
              toast.error("必须只选择一个根节点才可以进行树形结构变成框嵌套结构");
              return;
            }
            this.project.sectionPackManager.textNodeTreeToSection(selectedNodes[0]);
          }}
        />
      </div>
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description={"统一宽度，以最小宽度为准"}
          icon={<ChevronsRightLeft />}
          handleFunction={async () => {
            LayoutResizeManager.adjustSelectedTextNodeWidth("minWidth");
          }}
        />
        <div />
        <div />
        <ToolbarItem
          description={"统一宽度，以平均宽度为准"}
          icon={<MoveHorizontal />}
          handleFunction={async () => {
            LayoutResizeManager.adjustSelectedTextNodeWidth("average");
          }}
        />
        <div />
        <div />
        <ToolbarItem
          description={"统一宽度，以最大宽度为准"}
          icon={<Maximize2 className="rotate-45" />}
          handleFunction={async () => {
            LayoutResizeManager.adjustSelectedTextNodeWidth("maxWidth");
          }}
        />
        <div />
      </div>
      <div className={cell9ClassName}>
        <ToolbarItem
          description={isEnableDragAutoAlign ? "拖动吸附对齐：开启" : "拖动吸附对齐：关闭"}
          icon={<Magnet className={cn(!isEnableDragAutoAlign && "text-panel-details-text", "transition-transform")} />}
          handleFunction={async () => {
            Settings.enableDragAutoAlign = !Settings.enableDragAutoAlign;
          }}
        />
        <ToolbarItem
          description={isEnableDragToGridAutoAlign ? "网格吸附对齐：开启" : "网格吸附对齐：关闭"}
          icon={
            <Grid3x3
              className={cn(!isEnableDragToGridAutoAlign && "text-panel-details-text", "transition-transform")}
            />
          }
          handleFunction={async () => {
            Settings.enableDragAlignToGrid = !Settings.enableDragAlignToGrid;
          }}
        />
      </div>
    </div>
  );
}
