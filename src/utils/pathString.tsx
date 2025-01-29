import { family } from "./platform";

export namespace PathString {
  /**
   * 获取当前平台的路径分隔符
   * @returns
   */
  export function getSep(): string {
    const fam = family();
    if (fam === "windows") {
      return "\\";
    } else {
      return "/";
    }
  }

  /**
   * 将绝对路径转换为文件名
   * @param path
   * @returns
   */
  export function absolute2file(path: string): string {
    const fam = family();
    // const fam = "windows"; // vitest 测试时打开此行注释

    if (fam === "windows") {
      path = path.replace(/\\/g, "/");
    }
    const file = path.split("/").pop();
    if (!file) {
      throw new Error("Invalid path");
    }
    const parts = file.split(".");
    if (parts.length > 1) {
      return parts.slice(0, -1).join(".");
    } else {
      return file;
    }
  }

  /**
   * 根据文件的绝对路径，获取当前文件所在目录的路径
   * @param path 必须是一个文件的路径，不能是文件夹的路径
   * @returns
   */
  export function dirPath(path: string): string {
    const fam = family();
    // const fam = "windows"; // vitest 测试时打开此行注释

    if (fam === "windows") {
      path = path.replace(/\\/g, "/"); // 将反斜杠替换为正斜杠
    }

    const file = path.split("/").pop(); // 获取文件名
    if (!file) {
      throw new Error("Invalid path");
    }

    let directory = path.substring(0, path.length - file.length); // 获取目录路径
    if (directory.endsWith("/")) {
      directory = directory.slice(0, -1); // 如果目录路径以斜杠结尾，去掉最后的斜杠
    }

    if (fam === "windows") {
      // 再换回反斜杠
      return directory.replace(/\//g, "\\");
    }

    return directory; // 返回目录路径
  }

  /**
   * 获取符合路径文件名规则的时间字符串
   */
  export function getTime(): string {
    const dateTime = new Date().toLocaleString().replaceAll(/\//g, "-").replaceAll(" ", "_").replaceAll(":", "-");
    return dateTime;
  }

  /**
   * 检测一个字符串是否是一个有效的url网址
   * 用于判断是否可以打开浏览器
   * @param url
   * @returns
   */
  export function isValidURL(url: string): boolean {
    // 尝试解析国际化域名
    try {
      url = new URL(url).href;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // 如果不能直接解析，则尝试手动处理国际化域名
      if (typeof url === "string") {
        try {
          const parts = url.split("://");
          if (parts.length > 1) {
            // 只有在有协议的情况下才进行解码
            const protocol = parts[0];
            const rest = parts.slice(1).join("://");
            url = protocol + "://" + decodeURIComponent(rest);
          }
          url = new URL(url).href;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 如果仍然无法解析，则保持原始 URL
        }
      }
    }

    // 正则表达式用于验证 URL 格式
    const urlPattern =
      /^(https?|wss?):\/\/(?:[a-zA-Z0-9-]+(?:(?:\.[a-zA-Z0-9-]+)*))?(?::\d{1,5})?(?:\/[^?\s]*)?(?:\?[^#\s]*)?(?:#[^#\s]*)?$/;

    // 正则表达式用于验证 IP 地址形式的链接
    const ipPattern =
      /^(https?|wss?):\/\/((?:\d{1,3}\.){3}\d{1,3}|($[0-9a-fA-F:]+$))(?::\d{1,5})?(?:\/[^?\s]*)?(?:\?[^#\s]*)?(?:#[^#\s]*)?$/;

    // 尝试创建一个 URL 对象以验证 URL 的合法性
    try {
      // 如果 URL 不包含协议，则添加 http:// 以便构造函数可以解析
      if (!/^https?:\/\//i.test(url) && !/^wss?:\/\//i.test(url)) {
        url = "http://" + url;
      }

      // 构造 URL 对象并检查主机名是否有效
      const parsedUrl = new URL(url);

      // 检查主机名是否为空或无效
      if (parsedUrl.hostname.length === 0 || parsedUrl.hostname.includes(" ")) {
        return false;
      }

      // 检查主机名是否为 localhost 或者是有效的 IP 地址
      if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "obsidian" || ipPattern.test(url)) {
        return true;
      }

      // 使用正则表达式进一步验证 URL
      return urlPattern.test(url);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // 如果抛出异常，说明 URL 无效
      return false;
    }
  }
}
