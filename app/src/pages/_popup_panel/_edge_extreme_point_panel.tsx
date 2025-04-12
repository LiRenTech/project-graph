import { ArrowRightFromLine, ArrowUpToLine, SquareDot } from "lucide-react";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { Direction } from "../../types/directions";
import { ToolbarItem } from "../_toolbar";

/**
 * 设置连线的端点
 */
export default function EdgeExtremePointPanel() {
  const cell9ClassName = "border-1 bg-panel-bg grid grid-cols-3 grid-rows-3 rounded p-1 m-1";

  return (
    <div className="grid grid-cols-2 grid-rows-1">
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description="从上边缘发射"
          icon={<ArrowRightFromLine className="-rotate-90" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Up, true);
          }}
        />
        <div />
        <ToolbarItem
          description="从左边缘发射"
          icon={<ArrowRightFromLine className="-rotate-180" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Left, true);
          }}
        />
        <ToolbarItem
          description="从中心发射"
          icon={<SquareDot />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(null, true);
          }}
        />
        <ToolbarItem
          description="从右侧发射"
          icon={<ArrowRightFromLine />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Right, true);
          }}
        />
        <div />
        <ToolbarItem
          description="从底部发射"
          icon={<ArrowRightFromLine className="rotate-90" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Down, true);
          }}
        />
        <div />
      </div>
      <div className={cell9ClassName}>
        <div />
        <ToolbarItem
          description="从上边缘接收"
          icon={<ArrowUpToLine className="rotate-180" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Up);
          }}
        />
        <div />
        <ToolbarItem
          description="从左边缘接收"
          icon={<ArrowUpToLine className="rotate-90" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Left);
          }}
        />
        <ToolbarItem
          description="从中心接收"
          icon={<SquareDot />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(null);
          }}
        />
        <ToolbarItem
          description="从右侧接收"
          icon={<ArrowUpToLine className="-rotate-90" />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Right);
          }}
        />
        <div />
        <ToolbarItem
          description="从底部接收"
          icon={<ArrowUpToLine />}
          handleFunction={() => {
            StageManager.changeSelectedEdgeConnectLocation(Direction.Down);
          }}
        />
        <div />
      </div>
    </div>
  );
}
