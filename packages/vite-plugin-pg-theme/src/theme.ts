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

export function generateUtilities(themeContent: any) {
  function generateColors(obj: any, prefix: string = "", colors: string[] = []): string[] {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        colors = colors.concat(generateColors(obj[key], `${prefix}${key}-`, colors));
      } else {
        colors.push(`${prefix}${key}`);
      }
    }
    return colors.filter((color, index, arr) => arr.indexOf(color) === index);
  }
  const utilities = generateColors(themeContent)
    .map((color) =>
      color.replaceAll(
        /(-(hover|active|disabled|focus|focus-within|focus-visible|placeholder))?-(bg|text|border)$/gm,
        "",
      ),
    )
    .map(
      (color) => `\
@utility el-${color} {
  background-color: var(--color-${color}-bg);
  color: var(--color-${color}-text);
  border-color: var(--color-${color}-border, transparent);
  --tw-shadow-color: var(--color-${color}-shadow);
  &:hover {
    background-color: var(--color-${color}-hover-bg, var(--color-${color}-bg));
    color: var(--color-${color}-hover-text, var(--color-${color}-text));
    border-color: var(--color-${color}-hover-border, var(--color-${color}-border));
    --tw-shadow-color: var(--color-${color}-hover-shadow, var(--color-${color}-shadow));
  }
  &:active {
    background-color: var(--color-${color}-active-bg, var(--color-${color}-hover-bg, var(--color-${color}-bg)));
    color: var(--color-${color}-active-text, var(--color-${color}-hover-text, var(--color-${color}-text)));
    border-color: var(--color-${color}-active-border, var(--color-${color}-hover-border, var(--color-${color}-border)));
    --tw-shadow-color: var(--color-${color}-active-shadow, var(--color-${color}-hover-shadow, var(--color-${color}-shadow)));
  }
  &:disabled,
  &[disabled] {
    background-color: var(--color-${color}-disabled-bg, var(--color-${color}-bg));
    color: var(--color-${color}-disabled-text, var(--color-${color}-text));
    border-color: var(--color-${color}-disabled-border, var(--color-${color}-border));
    --tw-shadow-color: var(--color-${color}-disabled-shadow, var(--color-${color}-shadow));
  }
  &:focus {
    background-color: var(--color-${color}-focus-bg, var(--color-${color}-bg));
    color: var(--color-${color}-focus-text, var(--color-${color}-text));
    border-color: var(--color-${color}-focus-border, var(--color-${color}-border));
    --tw-shadow-color: var(--color-${color}-focus-shadow, var(--color-${color}-shadow));
  }
  &:focus-within {
    background-color: var(--color-${color}-focus-within-bg, var(--color-${color}-bg));
    color: var(--color-${color}-focus-within-text, var(--color-${color}-text));
    border-color: var(--color-${color}-focus-within-border, var(--color-${color}-border));
    --tw-shadow-color: var(--color-${color}-focus-within-shadow, var(--color-${color}-shadow));
  }
  &:focus-visible {
    background-color: var(--color-${color}-focus-visible-bg, var(--color-${color}-bg));
    color: var(--color-${color}-focus-visible-text, var(--color-${color}-text));
    border-color: var(--color-${color}-focus-visible-border, var(--color-${color}-border));
    --tw-shadow-color: var(--color-${color}-focus-visible-shadow, var(--color-${color}-shadow));
  }
  &::placeholder {
    color: var(--color-${color}-placeholder-text, var(--color-${color}-text));
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
