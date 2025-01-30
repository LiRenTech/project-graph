import { Color } from "../../../dataStruct/Color";
import { Settings } from "../../Settings";

interface EffectColors {
  /** 闪光线，切割线等白光刃的白色 */
  flash: Color;
  /** 粒子效果的颜色 */
  dash: Color;
  windowFlash: Color;
  /** 警告阴影的颜色 */
  warningShadow: Color;
  /** 成功阴影的颜色 */
  successShadow: Color;
}

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

  effects: EffectColors = {
    flash: Color.White,
    dash: Color.White,
    windowFlash: Color.White,
    warningShadow: Color.Red,
    successShadow: Color.Green,
  };

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
    style.effects = {
      flash: Color.White,
      dash: Color.White,
      windowFlash: Color.Black,
      warningShadow: Color.Red,
      successShadow: Color.Green,
    };
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
    style.CollideBoxSelectedColor = new Color(64, 209, 171);
    style.NodeDetailsTextColor = new Color(0, 0, 0);
    style.effects = {
      flash: Color.Black,
      dash: Color.Black,
      windowFlash: Color.White,
      warningShadow: Color.Red,
      successShadow: Color.Green,
    };
    return style;
  }

  static styleMacaron(): StageStyle {
    const style = new StageStyle();
    // 浅粉色背景
    style.BackgroundColor = new Color(249, 233, 234); // 樱粉色

    // 网格线
    style.GridNormalColor = new Color(98, 98, 111, 0.3);
    style.GridHeavyColor = new Color(98, 98, 111, 0.5);

    // 调试文字使用灰紫色
    style.DetailsDebugTextColor = new Color(152, 138, 158); // 灰紫

    // 选择框使用薄荷绿
    style.SelectRectangleBorderColor = new Color(71, 108, 27, 0.5); // 薄荷绿
    style.SelectRectangleFillColor = new Color(169, 221, 208, 0.3); // 浅薄荷

    // 元素边框使用珊瑚粉
    style.StageObjectBorderColor = new Color(242, 133, 133); // 珊瑚粉

    // 碰撞盒颜色
    style.CollideBoxPreSelectedColor = new Color(169, 221, 208, 0.3); // 薄荷绿
    style.CollideBoxSelectedColor = new Color(143, 93, 147); // 169, 221, 208

    // 文字使用深紫色
    style.NodeDetailsTextColor = new Color(107, 89, 108); // 深灰紫

    // 特效颜色调整
    style.effects = {
      flash: new Color(139, 88, 145),
      dash: new Color(107, 89, 108), // 薰衣草粒子
      windowFlash: new Color(249, 233, 234), // 背景同色
      warningShadow: new Color(177, 133, 189),
      successShadow: new Color(120, 147, 175),
    };
    return style;
  }

  // 其他风格的静态工厂方法可以按照类似的方式添加
  static styleFromTheme(theme: Settings.Settings["theme"]): StageStyle {
    switch (theme) {
      case "black":
        return StageStyle.styleDefault();
      case "white":
        return StageStyle.styleWhitePaper();
      case "macaron":
        return StageStyle.styleMacaron();
      default:
        return StageStyle.styleDefault();
    }
  }
}
