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
   * 通过路径字符串中，提取出文件名
   * 例如：
   * path = "C:/Users/admin/Desktop/test.txt"
   * 则返回 "test"
   * @param path
   */
  export function getFileNameFromPath(path: string): string {
    path = path.replace(/\\/g, "/");
    const parts = path.split("/");
    const fileName = parts[parts.length - 1];
    const parts2 = fileName.split(".");
    if (parts2.length > 1) {
      return parts2.slice(0, -1).join(".");
    } else {
      return fileName;
    }
  }

  /**
   * 获取符合路径文件名规则的时间字符串
   */
  export function getTime(): string {
    const dateTime = new Date().toLocaleString().replaceAll(/\//g, "-").replaceAll(" ", "_").replaceAll(":", "-");
    return dateTime;
  }

  /**
   * 获取一个相对路径，从一个绝对路径到另一个绝对路径的跳转
   * 如果无法获取，或者路径不合法，则返回空字符串
   * @param from
   * @param to
   * @returns 相对路径
   * 例如：
   * from = "C:/Users/admin/Desktop/test.txt"
   * to = "C:/Users/admin/Desktop/test2.txt"
   * 则返回 "./test2.txt"
   * from = "C:/Users/admin/Desktop/test.txt"
   * to = "C:/Users/admin/test2.txt"
   * 则返回 "../test2.txt"
   */
  export function getRelativePath(from: string, to: string): string {
    // 统一替换反斜杠为正斜杠，并分割路径为数组，过滤掉空的部分
    const fromParts = from
      .replace(/\\/g, "/")
      .split("/")
      .filter((p) => p !== "");
    const toParts = to
      .replace(/\\/g, "/")
      .split("/")
      .filter((p) => p !== "");

    // 检查根目录是否相同
    if (fromParts.length === 0 || toParts.length === 0 || fromParts[0] !== toParts[0]) {
      return "";
    }

    // 提取父目录数组和文件名
    const fromParent = fromParts.slice(0, fromParts.length - 1);
    const toParent = toParts.slice(0, toParts.length - 1);
    const toFileName = toParts[toParts.length - 1];

    // 找到共同层级i
    let i = 0;
    while (i < fromParent.length && i < toParent.length && fromParent[i] === toParent[i]) {
      i++;
    }

    // 计算需要向上退的层数
    const fromUpLevel = fromParent.length - i;

    // 生成向上的部分（如'../..'）
    const up = fromUpLevel > 0 ? Array(fromUpLevel).fill("..").join("/") : "";

    // 生成向下的部分（如'dir/subdir'）
    const down = toParent.slice(i).join("/");

    // 组合路径
    let relativePath = "";
    if (up) {
      relativePath += up;
      if (down) {
        relativePath += "/";
      }
    }
    if (down) {
      relativePath += down;
    }

    // 处理文件名部分
    if (relativePath) {
      relativePath += "/" + toFileName;
    } else {
      // 如果路径为空，说明父目录相同，直接返回当前目录下的文件名
      relativePath = "./" + toFileName;
    }

    return relativePath;
  }

  // 这个函数用AI生成，DeepSeek整整思考了四分钟，252秒，一次性全部通过测试，而其他大模型都无法通过测试。
  /**
   * 根据一个绝对路径和一个相对路径，获取新文件的绝对路径
   * @param currentPath 绝对路径
   * @param relativePath 相对路径
   * 例如：
   * currentPath = "C:/Users/admin/Desktop/test.txt"
   * relativePath = "./test2.txt"
   * 则返回 "C:/Users/admin/Desktop/test2.txt"
   *
   * currentPath = "C:/Users/admin/Desktop/test.txt"
   * relativePath = "../test2.txt"
   * 则返回 "C:/Users/admin/test2.txt"
   * @returns
   */
  export function relativePathToAbsolutePath(currentPath: string, relativePath: string): string {
    const { drive, parts: currentParts } = splitCurrentPath(currentPath);
    const relativeParts = splitRelativePath(relativePath);

    const mergedParts = [...currentParts];
    for (const part of relativeParts) {
      if (part === "..") {
        if (mergedParts.length > 0) {
          mergedParts.pop();
        }
      } else if (part !== "." && part !== "") {
        mergedParts.push(part);
      }
    }

    let absolutePath;
    if (drive) {
      absolutePath = `${drive}/`;
    } else {
      absolutePath = "/";
    }
    absolutePath += mergedParts.join("/");

    // 处理根目录情况
    if (mergedParts.length === 0) {
      absolutePath = drive ? `${drive}/` : "/";
    }

    // 替换多个连续的斜杠为单个斜杠
    absolutePath = absolutePath.replace(/\/+/g, "/");

    return absolutePath;
  }

  function splitCurrentPath(path: string) {
    path = path.replace(/\\/g, "/");
    let drive = "";
    const driveMatch = path.match(/^([a-zA-Z]:)(\/|$)/);
    if (driveMatch) {
      drive = driveMatch[1];
      path = path.substring(drive.length);
    }
    const parts = path.split("/").filter((p) => p !== "");
    return { drive, parts };
  }

  function splitRelativePath(relativePath: string) {
    relativePath = relativePath.replace(/\\/g, "/");
    return relativePath.split("/").filter((p) => p !== "");
  }

  /**
   * 检测一个字符串是否是一个有效的url网址
   * 用于判断是否可以打开浏览器
   * @param url
   * @returns
   */
  export function isValidURL(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;

    // 包含协议的正则（支持任意合法协议）
    const protocolPattern = /^[a-z][a-z0-9+.-]*:\/\//i;

    if (protocolPattern.test(trimmed)) {
      // 完整URL校验（包含协议）
      return /^[a-z][a-z0-9+.-]*:\/\/[^\s/?#].[^\s]*$/i.test(trimmed);
    } else {
      // 无协议时校验域名格式
      return /^(?:(localhost|(\d{1,3}\.){3}\d{1,3}|([a-z0-9-]+\.)+[a-z]{2,})|xn--[a-z0-9]+|[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+)(?::\d+)?(?:[/?#][^\s]*)?$/iu.test(
        trimmed,
      );
    }
  }
}
