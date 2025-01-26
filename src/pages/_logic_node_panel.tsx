import { v4 } from "uuid";
import Button from "../components/ui/Button";
import {
  LogicNodeNameEnum,
  LogicNodeNameToArgsTipsMap,
  LogicNodeNameToRenderNameMap,
} from "../core/service/dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { Camera } from "../core/stage/Camera";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { cn } from "../utils/cn";

/**
 *
 */
export default function LogicNodePanel({
  open = false,
  className = "",
}: {
  open: boolean;
  className: string;
}) {
  return (
    <div
      className={cn(
        "fixed -left-64 top-16 flex h-96 w-64 flex-col overflow-auto rounded-md bg-neutral-900 p-2 transition-all",
        {
          "left-0": open,
        },
        className,
      )}
    >
      <h2>逻辑节点</h2>
      {Object.values(LogicNodeNameEnum).map((name) => {
        return (
          <Button
            key={name}
            className="m-1 text-xs"
            tooltip={LogicNodeNameToArgsTipsMap[name]}
            onClick={() => {
              StageManager.addTextNode(
                new TextNode({
                  uuid: v4(),
                  location: [Camera.location.x, Camera.location.y],
                  text: name,
                  size: [10, 10],
                }),
              );
            }}
          >
            {LogicNodeNameToRenderNameMap[name]}
          </Button>
        );
      })}
    </div>
  );
}
