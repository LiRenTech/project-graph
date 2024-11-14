import { Color } from "../dataStruct/Color";
import { Settings } from "../Settings";

export class StageThemeStyle {
  /** 背景颜色 */
  BackgroundColor: Color = Color.Black;
  /** 网格细线颜色 */
  GridLineColor: Color = Color.Black;
  /** 网格粗线颜色 */
  GridBoldLineColor: Color = Color.Black;
  /** 左上角调试信息颜色 */
  DetailsDebugTextColor: Color = Color.Black;
  /** 红色警告切断线颜色 */
  CuttingWarningLineColor: Color = Color.Black;
  /** 准备切断时附着在 link 上的颜色 */
  WarningLinkCoverColor: Color = Color.Black;
  /** 所有选中的 link 的颜色 */
  SelectingLinkCoverColor: Color = Color.Black;
  /** 警告节点填充颜色 */
  WarningNodeCoverFillColor: Color = Color.Black;
  /** 警告节点边框颜色 */
  WarningNodeCoverStrokeColor: Color = Color.Black;
  /** 连接线颜色 */
  ConnectingLineColor: Color = Color.Black;
  /** 选择矩形边框颜色 */
  SelectRectangleBorderColor: Color = Color.Black;
  /** 选择矩形填充颜色 */
  SelectRectangleFillColor: Color = Color.Black;
  /** 选择矩形对角线颜色 */
  SelectLineColor: Color = Color.Black;
  /** 选择连线时矩形边框颜色 */
  SelectLineRectColor: Color = Color.Black;
  /** 节点填充颜色 */
  NodeFillColor: Color = Color.Black;
  /** 节点边框颜色 */
  NodeBorderColor: Color = Color.Black;
  /** 节点选中边框颜色 */
  NodeSelectedBorderColor: Color = Color.Black;
  /** 节点文本颜色 */
  NodeTextColor: Color = Color.Black;
  /** 节点详细信息文本颜色 */
  NodeDetailsTextColor: Color = Color.Black;
  /** 链接颜色 */
  LinkColor: Color = Color.Black;
  /** 链接文本颜色 */
  LinkTextColor: Color = Color.Black;
  /** 链接文本背景颜色 */
  LinkTextBgColor: Color = Color.Black;
  /** 拖拽文件时的十字线颜色 */
  DraggingFileLineColor: Color = Color.Black;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  static styleDefault(): StageThemeStyle {
    const style = new StageThemeStyle();
    style.BackgroundColor = new Color(43, 43, 43, 1);
    style.GridLineColor = new Color(255, 255, 255, 0.2);
    style.GridBoldLineColor = new Color(255, 255, 255, 0.4);
    style.DetailsDebugTextColor = new Color(255, 255, 255, 0.4);
    style.CuttingWarningLineColor = new Color(255, 0, 0, 1);
    style.WarningLinkCoverColor = new Color(255, 0, 0, 0.5);
    style.SelectingLinkCoverColor = new Color(0, 255, 0, 0.2);
    style.WarningNodeCoverFillColor = new Color(255, 0, 0, 0.5);
    style.WarningNodeCoverStrokeColor = new Color(255, 0, 0, 0.5);
    style.ConnectingLineColor = new Color(255, 255, 255);
    style.SelectRectangleBorderColor = new Color(255, 255, 255, 0.5);
    style.SelectRectangleFillColor = new Color(255, 255, 255, 0.08);
    style.SelectLineColor = new Color(0, 255, 0, 0.2);
    style.SelectLineRectColor = new Color(0, 255, 0, 0.5);
    style.NodeFillColor = new Color(31, 31, 31, 0.78);
    style.NodeBorderColor = new Color(204, 204, 204);
    style.NodeSelectedBorderColor = new Color(34, 217, 110);
    style.NodeTextColor = new Color(204, 204, 204);
    style.NodeDetailsTextColor = new Color(255, 255, 255);
    style.LinkColor = new Color(204, 204, 204);
    style.LinkTextColor = new Color(204, 204, 204);
    style.LinkTextBgColor = new Color(31, 31, 31, 0.5);
    style.DraggingFileLineColor = new Color(148, 220, 254);
    return style;
  }

  static styleWhitePaper(): StageThemeStyle {
    const style = new StageThemeStyle();
    style.BackgroundColor = new Color(255, 255, 255);
    style.GridLineColor = new Color(51, 51, 51, 0.4);
    style.GridBoldLineColor = new Color(20, 20, 20, 0.4);
    style.DetailsDebugTextColor = new Color(125, 125, 125, 0.4);
    style.CuttingWarningLineColor = new Color(255, 0, 0, 1);
    style.WarningLinkCoverColor = new Color(255, 0, 0, 0.5);
    style.SelectingLinkCoverColor = new Color(0, 255, 0, 0.2);
    style.ConnectingLineColor = new Color(0, 0, 0);
    style.SelectRectangleBorderColor = new Color(0, 0, 0, 0.5);
    style.SelectRectangleFillColor = new Color(0, 0, 0, 0.08);
    style.SelectLineColor = new Color(0, 255, 0, 0.5);
    style.SelectLineRectColor = new Color(0, 255, 0, 0.8);
    style.NodeFillColor = new Color(255, 255, 255, 0.78);
    style.NodeBorderColor = new Color(0, 0, 0);
    style.NodeSelectedBorderColor = new Color(34, 217, 110);
    style.NodeTextColor = new Color(0, 0, 0);
    style.NodeDetailsTextColor = new Color(0, 0, 0);
    style.LinkColor = new Color(0, 0, 0);
    style.LinkTextColor = new Color(0, 0, 0);
    style.LinkTextBgColor = new Color(200, 200, 200, 0.5);
    style.DraggingFileLineColor = new Color(148, 220, 254);
    return style;
  }

  // 其他风格的静态工厂方法可以按照类似的方式添加
  static styleFromTheme(theme: Settings.Settings["theme"]): StageThemeStyle {
    switch (theme) {
      case "black":
        return StageThemeStyle.styleDefault();
      case "white":
        return StageThemeStyle.styleWhitePaper();
      default:
        return StageThemeStyle.styleDefault();
    }
  }
}
