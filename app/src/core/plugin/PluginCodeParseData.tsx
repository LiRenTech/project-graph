/**
 * 插件代码解析数据
 */
export interface PluginCodeParseData {
  name: string;
  version: string;
  description: string;
  author: string;
}

/**
 * 从插件代码中解析出信息
 *
 * @param code 用户编写的脚本字符串
 * @returns 解析结果 { data: PluginCodeParseData, error: string, success: boolean }
 * @example
 * ```javascript
 * const code = `
 * // ==UserScript==
 * // @name     摄像机疯狂抖动插件
 * // @description 测试插件
 * // @version  1.0.0
 * // @author   Littlefean
 * // ==/UserScript==
 * `;
 * const result = parsePluginCode(code);
 * console.log(result);
 *
 * {
 *   data: { name: '摄像机疯狂抖动插件', version: '1.0.0', description: '测试插件', author: 'Littlefean' },
 *   error: '',
 *   success: true
 * }
 */
export function parsePluginCode(code: string): { data: PluginCodeParseData; error: string; success: boolean } {
  const result = { data: { name: "", version: "", description: "", author: "" }, error: "", success: false };
  if (!code) {
    result.error = "插件代码为空";
    return result;
  }
  const lines = code.split("\n");
  let name = "";
  let version = "";
  let description = "";
  let author = "";
  for (const line of lines) {
    if (line.startsWith("// @name")) {
      name = line.replace("// @name", "").trim();
    } else if (line.startsWith("// @version")) {
      version = line.replace("// @version", "").trim();
    } else if (line.startsWith("// @description")) {
      description = line.replace("// @description", "").trim();
    } else if (line.startsWith("// @author")) {
      author = line.replace("// @author", "").trim();
    }
  }
  if (name !== "" && version !== "" && description !== "" && author !== "") {
    result.data = { name, version, description, author };
    result.success = true;
  } else {
    result.error = "插件代码格式不正确\n";
    if (name === "") {
      result.error += "缺少 @name 信息\n";
    }
    if (version === "") {
      result.error += "缺少 @version 信息\n";
    }
    if (description === "") {
      result.error += "缺少 @description 信息\n";
    }
    if (author === "") {
      result.error += "缺少 @author 信息\n";
    }
  }

  return result;
}
