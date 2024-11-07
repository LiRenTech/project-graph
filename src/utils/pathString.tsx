export namespace PathString {
  export function absolute2file(path: string): string {
    if (path.startsWith("/")) {
      // TODO: 自动检测系统
      return path;
    } else if (path.includes("\\")) {
      const arr = path.split("\\");
      let fileName = arr.pop();
      if (fileName === undefined) {
        return "";
      }
      if (fileName.endsWith(".json")) {
        fileName = fileName.replace(".json", "");
      }
      return fileName;
    } else {
      return path;
    }
  }
}
