import { glob, readFile } from "node:fs/promises";
import { parseYamlWithFrontmatter } from "./yaml";

interface ThemeMetadata {
  id: string;
  author: string;
  type: "light" | "dark";
  description: Record<string, string>;
  name: Record<string, string>;
}
interface Theme {
  metadata: ThemeMetadata;
  content: any;
}

export async function parseThemeFiles(fileGlob: string | string[]) {
  const files = glob(fileGlob);
  const themes: Theme[] = [];
  for await (const file of files) {
    // 解析主题文件内容
    const { frontmatter: metadata, content } = parseYamlWithFrontmatter<ThemeMetadata, any>(
      await readFile(file, "utf-8"),
    );
    // 直接返回
    themes.push({ metadata, content });
  }
  return themes;
}

export function convertThemeToCss(themeContent: any) {
  function generateCssVariables(obj: any, prefix: string = "--color-", css: string = ""): string {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        // 如果值是对象，递归调用函数，并更新前缀
        css = generateCssVariables(obj[key], `${prefix}${camelCaseToDashCase(key)}-`, css);
      } else {
        // 否则，生成CSS变量
        css += `${prefix}${camelCaseToDashCase(key)}: var(${prefix}${camelCaseToDashCase(key)});\n`;
      }
    }
    return css;
  }
  return generateCssVariables(themeContent);
}

/*
button-bg
button-text
button-border
button-shadow
button-hover-bg
button-hover-text
button-hover-border
button-hover-shadow
button-active-bg
button-active-text
button-active-border
button-active-shadow
button-disabled-bg
button-disabled-text
button-disabled-border
button-disabled-shadow
以上都算一个color: button
*/

export function generateUtilities(themeContent: any) {
  function generateColors(obj: any, prefix: string = "", colors: string[] = []): string[] {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        colors = colors.concat(generateColors(obj[key], `${prefix}${key}-`, colors));
      } else {
        colors.push(`${prefix}${key}`);
      }
    }
    return colors;
  }
  const utilities = generateColors(themeContent)
    .map((color) => color.replaceAll(/(-(hover|active|disabled))?-(bg|text|border)$/gm, ""))
    .filter((color, index, arr) => arr.indexOf(color) === index)
    .map(
      (color) => `\
@utility el-${color} {
  background-color: var(--color-${color}-bg);
  color: var(--color-${color}-text);
  border-color: var(--color-${color}-border);
  --tw-shadow-color: var(--color-${color}-shadow);
  &:hover {
    background-color: var(--color-${color}-hover-bg);
    color: var(--color-${color}-hover-text);
    border-color: var(--color-${color}-hover-border);
    --tw-shadow-color: var(--color-${color}-hover-shadow);
  }
  &:active {
    background-color: var(--color-${color}-active-bg);
    color: var(--color-${color}-active-text);
    border-color: var(--color-${color}-active-border);
    --tw-shadow-color: var(--color-${color}-active-shadow);
  }
  &:disabled,
  &[disabled] {
    background-color: var(--color-${color}-disabled-bg);
    color: var(--color-${color}-disabled-text);
    border-color: var(--color-${color}-disabled-border);
    --tw-shadow-color: var(--color-${color}-disabled-shadow);
  }
}
`,
    )
    .join("");
  return utilities;
}

export function camelCaseToDashCase(text: string) {
  return text.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
