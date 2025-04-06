export interface PluginCodeParseData {
  name: string;
  version: string;
  description: string;
  author: string;
}

// ```javascript
// // ==UserScript==
// // @name     摄像机疯狂抖动插件
// // @description 测试插件
// // @version  1.0.0
// // @author   Littlefean
// // ==/UserScript==
// ```

/**
 * 从插件代码中解析出信息
 *
 * @param code
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
  if (name && version && description && author) {
    result.data = { name, version, description, author };
    result.success = true;
  } else {
    result.error = "插件代码格式不正确";
  }

  return result;
}
