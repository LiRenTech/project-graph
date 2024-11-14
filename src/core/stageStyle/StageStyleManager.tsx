import { Settings } from "../Settings";
import { StageThemeStyle } from "./stageStyle";

/**
 * 舞台上的颜色风格管理器
 */
export namespace StageStyleManager {
  export let currentStyle: StageThemeStyle = StageThemeStyle.styleDefault();

  // 软件启动运行一次
  export function init() {
    Settings.watch("theme", (value) => {
      currentStyle = StageThemeStyle.styleFromTheme(value);
    })
  }
}