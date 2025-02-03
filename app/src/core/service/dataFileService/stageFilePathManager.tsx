export class StageFilePathManager {
  public draftName = "Project Graph";

  private currentPath = "Project Graph";
  /**
   * 是否是草稿
   * @returns
   */
  isDraft() {
    return this.currentPath === "Project Graph";
  }

  /**
   * 此函数唯一的调用：只能在app.tsx的useEffect检测函数中调用
   * 为了同步状态管理中的路径。
   * @param path
   */
  setPathInEffect(path: string) {
    this.currentPath = path;
  }

  /**
   * 提供一个函数供外部调用，获取当前路径
   * @returns
   */
  getFilePath() {
    return this.currentPath;
  }
}
