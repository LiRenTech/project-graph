import { family } from "@tauri-apps/plugin-os";

export namespace PathString {
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
    const dateTime = new Date()
      .toLocaleString()
      .replaceAll(/\//g, "-")
      .replaceAll(" ", "_")
      .replaceAll(":", "-");
    return dateTime;
  }

  /**
   * 检测一个字符串是否是一个有效的url网址
   * 用于判断是否可以打开浏览器
   * @param url
   * @returns
   */
  export function isValidURL(url: string): boolean {
    const urlPattern =
      /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(:\d{1,5})?(\/[^\s]*)?$/i;
    return urlPattern.test(url);
  }
}
