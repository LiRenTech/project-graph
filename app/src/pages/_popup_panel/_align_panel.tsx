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
import { StageEntityMoveManager } from "../../core/stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageAutoAlignManager } from "../../core/stage/stageManager/concreteMethods/StageAutoAlignManager";
export default function AlignNodePanel() {
  const [isEnableDragAutoAlign, setEnableDragAutoAlign] = useState(false);

  useEffect(() => {
    Settings.watch("enableDragAutoAlign", (value) => {
      setEnableDragAutoAlign(value);
    });
  }, []);
  const cell9ClassName = "border-1 bg-panel-bg grid grid-cols-3 grid-rows-3 rounded p-1 m-1";

  return (
    <div className="grid grid-cols-2 grid-rows-2">
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description="顶对齐"
          icon={<AlignStartHorizontal />}
          handleFunction={() => {
            StageEntityMoveManager.alignTop();
          }}
        />
        <div />
        <ToolbarItem
          description="左对齐"
          icon={<AlignStartVertical />}
          handleFunction={() => {
            StageEntityMoveManager.alignLeft();
          }}
        />
        <div />
        <ToolbarItem
          description="右对齐"
          icon={<AlignEndVertical />}
          handleFunction={() => {
            StageEntityMoveManager.alignRight();
          }}
        />
        <div />
        <ToolbarItem
          description="底对齐"
          icon={<AlignEndHorizontal />}
          handleFunction={() => {
            StageEntityMoveManager.alignBottom();
          }}
        />
        <div />
      </div>

      <div className={cell9ClassName}>
        <ToolbarItem
          description="相等间距垂直对齐"
          icon={<AlignVerticalSpaceBetween />}
          handleFunction={() => {
            StageEntityMoveManager.alignVerticalSpaceBetween();
          }}
        />
        <div />
        <ToolbarItem
          description="相等间距水平对齐"
          icon={<AlignHorizontalSpaceBetween />}
          handleFunction={() => {
            StageEntityMoveManager.alignHorizontalSpaceBetween();
          }}
        />
        <ToolbarItem
          description="中心垂直对齐"
          icon={<AlignCenterVertical />}
          handleFunction={() => {
            StageEntityMoveManager.alignCenterVertical();
          }}
        />
        <div />
        <ToolbarItem
          description="中心水平对齐"
          icon={<AlignCenterHorizontal />}
          handleFunction={() => {
            StageEntityMoveManager.alignCenterHorizontal();
          }}
        />
      </div>
      <div className={cell9ClassName}>
        <div />
        <div />
        <div />
        <div />
        <div />
        <ToolbarItem
          description="向右自动树形布局"
          icon={<Network className="-rotate-90" />}
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
                const entities = StageManager.getSelectedEntities();
                for (const entity of entities) {
                  if (entity instanceof ConnectableEntity) {
                    StageAutoAlignManager.autoLayoutSelectedFastTreeModeRight(entity);
                    return;
                  }
                }
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
        <div />
        <ToolbarItem
          description="向下自动树形布局"
          icon={<Network />}
          handleFunction={() => {
            const selected = StageManager.getSelectedEntities();
            if (selected.length !== 1) {
              Dialog.show({
                title: "选择节点数量不为1",
                content: "必须只选择一个根节点才可以进行树形结构布局，且连接的节点必须符合树形结构",
              });
              return;
            }
            const selectedEntity = selected[0];
            if (selectedEntity instanceof ConnectableEntity) {
              if (GraphMethods.isTree(selectedEntity)) {
                const entities = StageManager.getSelectedEntities();
                for (const entity of entities) {
                  if (entity instanceof ConnectableEntity) {
                    StageAutoAlignManager.autoLayoutSelectedFastTreeModeDown(entity);
                    return;
                  }
                }
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
        <div />
      </div>
      <div className={cell9ClassName}>
        <ToolbarItem
          description="尽可能排列成正方形"
          icon={<LayoutGrid />}
          handleFunction={() => {
            StageEntityMoveManager.layoutToSquare();
          }}
        />
        <ToolbarItem
          description="排一串"
          icon={<Columns4 />}
          handleFunction={() => {
            StageEntityMoveManager.layoutToTightSquare();
          }}
        />
        <ToolbarItem
          description={isEnableDragAutoAlign ? "拖动吸附对齐：开启" : "拖动吸附对齐：关闭"}
          icon={<Magnet className={cn(!isEnableDragAutoAlign && "text-panel-details-text", "transition-transform")} />}
          handleFunction={async () => {
            Settings.set("enableDragAutoAlign", !(await Settings.get("enableDragAutoAlign")));
          }}
        />
      </div>
    </div>
  );
}
