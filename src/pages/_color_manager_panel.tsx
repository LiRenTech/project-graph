import { useEffect, useState } from "react";
import { Color } from "../core/dataStruct/Color";
import { ColorManager } from "../core/ColorManager";
import Button from "../components/ui/Button";
import { Dialog } from "../utils/dialog";

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
    <div className="h-96 w-96 bg-neutral-700 p-4">
      <div>
        <p>当前颜色：</p>
        {/* <ColorDotElement color={Color.Red} /> */}
        <div className="flex flex-wrap items-center justify-center">
          {currentColorList.map((color) => (
            <ColorDotElement key={color.toString()} color={color} />
          ))}
        </div>
      </div>
      <div>
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
    </div>
  );
}
function ColorDotElement({ color }: { color: Color }) {
  const r = color.r;
  const g = color.g;
  const b = color.b;
  const a = color.a;
  return (
    <div
      className="relative m-1 h-8 w-8 rounded-full"
      style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }}
    >
      <Button
        className="absolute -right-2 -top-2 h-2 w-2 rounded-full text-xs"
        onClick={() => {
          ColorManager.removeUserEntityFillColor(color).then((res) => {
            console.log(res);
          });
        }}
      >
        x
      </Button>
    </div>
  );
}
