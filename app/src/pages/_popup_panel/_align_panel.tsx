import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  Columns4,
  LayoutGrid,
  Magnet,
  Network,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "../../components/dialog";
import { Settings } from "../../core/service/Settings";
import { GraphMethods } from "../../core/stage/stageManager/basicMethods/GraphMethods";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { ConnectableEntity } from "../../core/stage/stageObject/abstract/ConnectableEntity";
import { cn } from "../../utils/cn";
import { ToolbarItem } from "../_toolbar";
export default function AlignNodePanel() {
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
