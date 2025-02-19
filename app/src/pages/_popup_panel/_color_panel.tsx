import { Blend, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { Popup } from "../../components/popup";
import { Color } from "../../core/dataStruct/Color";
import { ColorManager } from "../../core/service/feedbackService/ColorManager";
import { Settings } from "../../core/service/Settings";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { cn } from "../../utils/cn";
import ColorManagerPanel from "./_color_manager_panel";
/**
 * 调色盘面板
 * @param param0
 * @returns
 */
export default function ColorPanel() {
  const [currentColors, setCurrentColors] = useState<Color[]>([]);
  const [autoFillNodeColor, setAutoFillNodeColor] = useState<Color>(Color.Transparent);
  const [autoFillNodeColorEnable, setAutoFillNodeColorEnable] = useState(true);

  useEffect(() => {
    ColorManager.getUserEntityFillColors().then((colors) => {
      setCurrentColors(colors);
    });
    Settings.watch("autoFillNodeColor", (value) => {
      setAutoFillNodeColor(new Color(...value));
    });
    Settings.watch("autoFillNodeColorEnable", (value) => {
      setAutoFillNodeColorEnable(value);
    });
  }, []);

  const handleClickSwitchNodeFillColor = () => {
    Settings.set("autoFillNodeColorEnable", !autoFillNodeColorEnable);
  };

  return (
    <div className="bg-panel-bg flex h-64 w-64 flex-col rounded-lg">
      {/* 官方提供的默认颜色 */}
      <div className="flex flex-wrap items-center justify-center">
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-red-500 hover:scale-125"
          onClick={() => {
            const color = new Color(239, 68, 68);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-yellow-500 hover:scale-125"
          onClick={() => {
            const color = new Color(234, 179, 8);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-green-600 hover:scale-125"
          onClick={() => {
            const color = new Color(22, 163, 74);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-blue-500 hover:scale-125"
          onClick={() => {
            const color = new Color(59, 130, 246);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        <div
          className="m-1 h-5 w-5 cursor-pointer rounded-full bg-purple-500 hover:scale-125"
          onClick={() => {
            const color = new Color(168, 85, 247);
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        />
        {/* 清除颜色 */}
        <div
          className="m-1 h-5 w-5 animate-pulse cursor-pointer rounded-full bg-transparent text-center text-sm hover:scale-125"
          onClick={() => {
            const color = Color.Transparent;
            StageManager.setEntityColor(color);
            StageManager.setEdgeColor(color);
            Settings.set("autoFillNodeColor", color.toArray());
          }}
        >
          <Blend className="h-5 w-5" />
        </div>
      </div>
      {/* 按钮 */}
      <div className="flex flex-wrap items-center justify-center">
        {/* 临时自定义 */}
        <input
          type="color"
          id="colorPicker"
          value="#ff0000"
          onChange={(e) => {
            const color = e.target.value;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            StageManager.setEntityColor(new Color(r, g, b));
            StageManager.setEdgeColor(new Color(r, g, b));
          }}
        ></input>
        <Button
          onClick={() => {
            Popup.show(<ColorManagerPanel />);
          }}
        >
          打开颜色管理
        </Button>
      </div>
      <hr className="text-panel-details-text my-2" />
      {/* 用户颜色库 */}
      <div className="flex max-w-64 flex-1 flex-wrap items-center justify-center">
        {currentColors.map((color) => {
          return (
            <div
              className="m-1 h-5 w-5 cursor-pointer rounded-full hover:scale-125"
              key={color.toString()}
              style={{
                backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
              }}
              onClick={() => {
                StageManager.setEntityColor(color);
                StageManager.setEdgeColor(color);
                Settings.set("autoFillNodeColor", color.toArray());
              }}
            />
          );
        })}
      </div>
      <hr className="text-panel-details-text my-2" />
      {/* 自动创建节点的颜色 */}
      <div className="flex justify-center">
        <span className="flex items-center justify-center text-sm">
          <span className={cn(!autoFillNodeColorEnable && "opacity-50")}>创建节点自动上色</span>
          <div
            className={cn("m-1 h-5 w-5 rounded-full border-2", !autoFillNodeColorEnable && "scale-50")}
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
      </div>
    </div>
  );
}
