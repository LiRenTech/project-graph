import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { v4 } from "uuid";
import Button from "../../components/Button";
import {
  LogicNodeNameEnum,
  LogicNodeNameToArgsTipsMap,
  LogicNodeNameToRenderNameMap,
} from "../../core/service/dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { SubWindow } from "../../core/service/SubWindow";
import { Camera } from "../../core/stage/Camera";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { TextNode } from "../../core/stage/stageObject/entity/TextNode";

/**
 *
 */
export default function LogicNodeWindow() {
  return (
    <div className="flex flex-col">
      {Object.values(LogicNodeNameEnum).map((name) => {
        return (
          <Button
            key={name}
            className="m-1 text-xs"
            tooltip={LogicNodeNameToArgsTipsMap[name]}
            onClick={() => {
              StageManager.addTextNode(
                new TextNode(this.project, {
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

LogicNodeWindow.open = () => {
  SubWindow.create({
    title: "逻辑节点",
    children: <LogicNodeWindow />,
    rect: new Rectangle(new Vector(100, 100), new Vector(150, 500)),
  });
};
