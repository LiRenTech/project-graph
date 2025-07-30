import { Color } from "@graphif/data-structures";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

/**
 * 自动设置颜色的面板
 * @returns
 */
export default function ColorAutoPanel() {
  const [autoFillNodeColor, setAutoFillNodeColor] = useState<Color>(Color.Transparent);
  const [autoFillNodeColorEnable, setAutoFillNodeColorEnable] = useState(true);
  const [autoFillPenStrokeColor, setAutoFillPenStrokeColor] = useState<Color>(Color.Transparent);
  const [autoFillPenStrokeColorEnable, setAutoFillPenStrokeColorEnable] = useState(true);

  useEffect(() => {
    Settings.watch("autoFillNodeColor", (value) => {
      setAutoFillNodeColor(new Color(...value));
    });
    Settings.watch("autoFillNodeColorEnable", (value) => {
      setAutoFillNodeColorEnable(value);
    });
    Settings.watch("autoFillPenStrokeColor", (value) => {
      setAutoFillPenStrokeColor(new Color(...value));
    });
    Settings.watch("autoFillPenStrokeColorEnable", (value) => {
      setAutoFillPenStrokeColorEnable(value);
    });
  }, []);

  const handleClickSwitchNodeFillColor = () => {
    Settings.set("autoFillNodeColorEnable", !autoFillNodeColorEnable);
  };
  const handleClickSwitchPenStrokeColor = () => {
    Settings.set("autoFillPenStrokeColorEnable", !autoFillPenStrokeColorEnable);
  };

  const changeAutoFillNodeColor = (color: Color) => {
    setAutoFillNodeColor(color);
    Settings.set("autoFillNodeColor", color.toArray());
  };
  const changeAutoFillPenStrokeColor = (color: Color) => {
    setAutoFillPenStrokeColor(color);
    Settings.set("autoFillPenStrokeColor", color.toArray());
  };

  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">设置颜色开关</h3>
      <div className="flex flex-col justify-center">
        <span className="flex items-center justify-center text-sm">
          <span className={cn(!autoFillNodeColorEnable && "opacity-50")}>创建节点自动上色</span>
          <div
            className={cn("m-1 h-5 w-5 rounded border-2", !autoFillNodeColorEnable && "scale-50")}
            style={{
              backgroundColor: autoFillNodeColor.toString(),
            }}
          ></div>
          {autoFillNodeColorEnable ? (
            <ToggleRight className="cursor-pointer" onClick={handleClickSwitchNodeFillColor} />
          ) : (
            <ToggleLeft className="cursor-pointer" onClick={handleClickSwitchNodeFillColor} />
          )}
        </span>
        <span className="flex items-center justify-center text-sm">
          <span className={cn(!autoFillPenStrokeColorEnable && "opacity-50")}>画笔自动颜色</span>
          <div
            className={cn("m-1 h-5 w-5 rounded border-2", !autoFillPenStrokeColorEnable && "scale-50")}
            style={{
              backgroundColor: autoFillPenStrokeColor.toString(),
            }}
          ></div>
          {autoFillPenStrokeColorEnable ? (
            <ToggleRight className="cursor-pointer" onClick={handleClickSwitchPenStrokeColor} />
          ) : (
            <ToggleLeft className="cursor-pointer" onClick={handleClickSwitchPenStrokeColor} />
          )}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-bold">设置具体颜色</h3>
      <div className="flex flex-col justify-center">
        <span>节点自动填充的颜色</span>
        <input
          type="color"
          className="cursor-pointer"
          value={autoFillNodeColor.toHexStringWithoutAlpha()}
          onChange={(e) => changeAutoFillNodeColor(Color.fromHex(e.target.value))}
        ></input>
      </div>
      <div className="flex flex-col justify-center">
        <span>画笔自动颜色</span>
        <input
          type="color"
          className="cursor-pointer"
          value={autoFillPenStrokeColor.toHexStringWithoutAlpha()}
          onChange={(e) => changeAutoFillPenStrokeColor(Color.fromHex(e.target.value))}
        ></input>
      </div>
    </div>
  );
}
