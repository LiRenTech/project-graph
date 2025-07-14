import { service } from "../../../Project";
import { Settings } from "../../Settings";
import { StageStyle } from "./stageStyle";

/**
 * 舞台上的颜色风格管理器
 */
@service("stageStyleManager")
export class StageStyleManager {
  currentStyle: StageStyle = StageStyle.styleFromTheme("dark");

  // 软件启动运行一次
  constructor() {
    Settings.watch("theme", (value) => {
      this.currentStyle = StageStyle.styleFromTheme(value);
    });
  }
}
