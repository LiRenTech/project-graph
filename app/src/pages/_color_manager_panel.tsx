import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Dialog } from "../components/dialog";
import { Color } from "../core/dataStruct/Color";
import { ColorManager } from "../core/service/feedbackService/ColorManager";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { TextNode } from "../core/stage/stageObject/entity/TextNode";
import { Section } from "../core/stage/stageObject/entity/Section";
import { LineEdge } from "../core/stage/stageObject/association/LineEdge";
import { ArrowRightLeft, Pipette } from "lucide-react";

/**
 * 自定义颜色设置面板
 *
 *
 */
export default function ColorManagerPanel() {
  useEffect(() => {
    ColorManager.getUserEntityFillColors().then((colors) => {
      setCurrentColorList(colors);
    });
  });
  const [preAddColor, setPreAddColor] = useState("#000000");
  const [currentColorList, setCurrentColorList] = useState<Color[]>([]);

  return (
    <div className="bg-panel-bg flex h-96 w-96 flex-col overflow-auto p-4">
      <div>
        <p>我的颜色库：</p>
        {/* <ColorDotElement color={Color.Red} /> */}
        <div className="flex flex-wrap items-center justify-center">
          {currentColorList.map((color) => (
            <ColorDotElement
              key={color.toString()}
              color={color}
              onclick={() => {
                const rgbSharpString = color.toHexString();
                if (rgbSharpString.length === 9) {
                  // 去掉透明度
                  setPreAddColor(rgbSharpString.slice(0, 7));
                }
              }}
            />
          ))}
        </div>
        {currentColorList.length !== 0 && (
          <div className="text-panel-details-text text-center text-xs">提示：点击颜色可以复制颜色值到待添加颜色</div>
        )}
      </div>
      <div className="flex items-center justify-center">
        <p>添加颜色：</p>
        <input
          type="color"
          id="colorPicker"
          value={preAddColor}
          onChange={(e) => {
            const color = e.target.value;
            setPreAddColor(color);
          }}
        ></input>
        <Button
          className="text-xs"
          onClick={() => {
            const color = new Color(
              parseInt(preAddColor.slice(1, 3), 16),
              parseInt(preAddColor.slice(3, 5), 16),
              parseInt(preAddColor.slice(5, 7), 16),
            );
            ColorManager.addUserEntityFillColor(color).then((res) => {
              // setPreAddColor(Color.getRandom().toHexString());
              if (!res) {
                Dialog.show({
                  title: "添加失败",
                  content: "不要添加重复的颜色",
                });
              }
            });
          }}
        >
          确认添加
        </Button>
      </div>

      <div className="flex">
        <Button
          onClick={() => {
            const selectedStageObjects = StageManager.getSelectedStageObjects();
            if (selectedStageObjects.length === 0) {
              Dialog.show({
                title: "未选择对象",
                content: "请先选择一个或多个有颜色的节点或连线",
              });
              return;
            }
            selectedStageObjects.forEach((stageObject) => {
              if (stageObject instanceof TextNode) {
                ColorManager.addUserEntityFillColor(stageObject.color);
              } else if (stageObject instanceof Section) {
                ColorManager.addUserEntityFillColor(stageObject.color);
              } else if (stageObject instanceof LineEdge) {
                ColorManager.addUserEntityFillColor(stageObject.color);
              }
            });
          }}
        >
          <Pipette />
          将选中的节点颜色添加到库
        </Button>
        <Button
          onClick={() => {
            ColorManager.organizeUserEntityFillColors();
          }}
        >
          <ArrowRightLeft />
          整理顺序
        </Button>
      </div>
    </div>
  );
}

function ColorDotElement({ color, onclick }: { color: Color; onclick: (e: any) => void }) {
  const r = color.r;
  const g = color.g;
  const b = color.b;
  const a = color.a;
  return (
    <div className="my-1">
      <div
        className="relative mx-1 h-4 min-w-4 rounded-full hover:cursor-pointer"
        style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }}
        onClick={onclick}
      >
        <Button
          className="absolute -right-2 -top-2 h-2 w-2 rounded-full text-xs"
          onClick={() => {
            ColorManager.removeUserEntityFillColor(color);
          }}
          tooltip="删除"
        >
          x
        </Button>
      </div>
      <span className="mx-0.5 cursor-text select-all rounded bg-black px-1 text-xs text-neutral-300">{`${r}, ${g}, ${b}`}</span>
    </div>
  );
}
