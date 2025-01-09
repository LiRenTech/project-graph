import { Color } from "../dataStruct/Color";
import { Settings } from "../Settings";

export class StageStyle {
  /** 背景颜色 */
  BackgroundColor: Color = Color.Black;
  /** 网格其他坐标轴上的颜色 */
  GridNormalColor: Color = Color.Black;
  /** 网格上y=0或x=0坐标轴上的颜色 */
  GridHeavyColor: Color = Color.Black;
  /** 左上角调试信息颜色 */
  DetailsDebugTextColor: Color = Color.Black;

  /** 选择矩形边框颜色 */
  SelectRectangleBorderColor: Color = Color.Black;
  /** 选择矩形填充颜色 */
  SelectRectangleFillColor: Color = Color.Black;

  /** 节点边框颜色，包括线条颜色，节点边框，箭头等等 */
  StageObjectBorderColor: Color = Color.Black;
  /** 节点详细信息文本颜色 */
  NodeDetailsTextColor: Color = Color.Black;

  /** 已经选中的颜色 */
  CollideBoxSelectedColor: Color = Color.Black;
  /** 准备选中的绿色 */
  CollideBoxPreSelectedColor: Color = Color.Black;
  /** 准备删除的红色 */
  CollideBoxPreDeleteColor: Color = Color.Black;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  static styleDefault(): StageStyle {
    const style = new StageStyle();
    style.BackgroundColor = new Color(31, 31, 31, 1);
    style.GridNormalColor = new Color(255, 255, 255, 0.2);
    style.GridHeavyColor = new Color(255, 255, 255, 0.3);
    style.DetailsDebugTextColor = new Color(255, 255, 255, 0.5);
    style.SelectRectangleBorderColor = new Color(255, 255, 255, 0.5);
    style.SelectRectangleFillColor = new Color(255, 255, 255, 0.08);
    style.StageObjectBorderColor = new Color(204, 204, 204);
    style.CollideBoxPreSelectedColor = new Color(0, 255, 0, 0.2);
    style.CollideBoxSelectedColor = new Color(34, 217, 110);
    style.NodeDetailsTextColor = new Color(255, 255, 255);

    return style;
  }

  static styleWhitePaper(): StageStyle {
    const style = new StageStyle();
    style.BackgroundColor = new Color(255, 255, 255);
    style.GridNormalColor = new Color(51, 51, 51, 0.4);
    style.GridHeavyColor = new Color(20, 20, 20, 0.4);
    style.DetailsDebugTextColor = new Color(125, 125, 125, 0.4);
    style.SelectRectangleBorderColor = new Color(0, 0, 0, 0.5);
    style.SelectRectangleFillColor = new Color(0, 0, 0, 0.08);
    style.StageObjectBorderColor = new Color(0, 0, 0);
    style.CollideBoxPreSelectedColor = new Color(0, 255, 0, 0.2);
    style.CollideBoxSelectedColor = new Color(34, 217, 110);
    style.NodeDetailsTextColor = new Color(0, 0, 0);
    return style;
  }

  // 其他风格的静态工厂方法可以按照类似的方式添加
  static styleFromTheme(theme: Settings.Settings["theme"]): StageStyle {
    switch (theme) {
      case "black":
        return StageStyle.styleDefault();
      case "white":
        return StageStyle.styleWhitePaper();
      default:
        return StageStyle.styleDefault();
    }
  }
}
