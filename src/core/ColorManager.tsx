import { Store } from "@tauri-apps/plugin-store";
import { createStore } from "../utils/store";
import { Color } from "./dataStruct/Color";

export namespace ColorManager {
  let store: Store;

  export type ColorData = {
    r: number;
    g: number;
    b: number;
    a: number;
  };

  export async function init() {
    store = await createStore("colors.json");
    store.save();
  }

  export async function getUserEntityFillColors(): Promise<Color[]> {
    const data = ((await store.get("entityFillColors")) as ColorData[]) || [];
    const result: Color[] = [];
    for (const colorData of data) {
      const color = new Color(
        colorData.r,
        colorData.g,
        colorData.b,
        colorData.a,
      );
      result.push(color);
    }
    return result;
  }

  function colorToColorData(colors: Color[]): ColorData[] {
    const result: ColorData[] = [];
    for (const color of colors) {
      const colorData: ColorData = {
        r: color.r,
        g: color.g,
        b: color.b,
        a: color.a,
      };
      result.push(colorData);
    }
    return result;
  }

  /**
   * 添加一个颜色，如果已经有这个颜色了，则不做任何事情
   * @param color
   */
  export async function addUserEntityFillColor(color: Color) {
    const colorData = await getUserEntityFillColors();
    // 先检查下有没有这个颜色
    for (const c of colorData) {
      if (c.equals(color)) {
        return false;
      }
    }
    colorData.push(color);
    await store.set("entityFillColors", colorToColorData(colorData));
    store.save();
    return true;
  }

  /**
   * 删除一个颜色，如果没有则不做任何事情
   * @param color
   */
  export async function removeUserEntityFillColor(color: Color) {
    const colors = await getUserEntityFillColors();
    const colorData = colorToColorData(colors);

    let index = -1;
    for (let i = 0; i < colorData.length; i++) {
      const c = new Color(
        colorData[i].r,
        colorData[i].g,
        colorData[i].b,
        colorData[i].a,
      );
      if (c.equals(color)) {
        index = i;
        break;
      }
    }

    if (index >= 0) {
      colors.splice(index, 1);
      store.set("entityFillColors", colorToColorData(colors));
      store.save();
      return true;
    }
    return false;
  }
}
/**
json数据格式
{
  "entityFillColors": [
    [r, g, b, a],
    [r, g, b, a],
  ]
}
 *
 */
