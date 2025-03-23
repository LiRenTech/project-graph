import { camelCaseToDashCase } from "../../utils/font";
import { parseYamlWithFrontmatter } from "../../utils/yaml";

export namespace Themes {
  export type Metadata = {
    id: string;
    author: string;
    description: {
      en: string;
      zh_CN: string;
    };
    name: Record<string, string>;
  };
  export const builtinThemes = Object.values(
    import.meta.glob<string>("../../themes/*.pg-theme", {
      eager: true,
      import: "default",
      query: "?raw",
    }),
  ).map((theme) => {
    console.log(theme);
    const data = parseYamlWithFrontmatter<Themes.Metadata, any>(theme);
    console.log(data);
    return {
      metadata: data.frontmatter,
      content: data.content,
    };
  });

  export function getThemeById(id: string) {
    return builtinThemes.find((theme) => theme.metadata.id === id);
  }
  /**
   * 把theme.content转换成CSS样式
   * @param theme getThemeById返回的theme对象中的content属性
   */
  export function convertThemeToCSS(theme: any) {
    function generateCSSVariables(obj: any, prefix: string = "--color-", css: string = ""): string {
      for (const key in obj) {
        if (typeof obj[key] === "object") {
          // 如果值是对象，递归调用函数，并更新前缀
          css = generateCSSVariables(obj[key], `${prefix}${camelCaseToDashCase(key)}-`, css);
        } else {
          // 否则，生成CSS变量
          css += `${prefix}${camelCaseToDashCase(key)}: ${obj[key]};\n`;
        }
      }
      return css;
    }
    return generateCSSVariables(theme);
  }
}
